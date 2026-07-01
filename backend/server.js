const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');

const app = express();
app.use(cors());

// Region (must match your AWS region)
const cloudwatch = new AWS.CloudWatch({
  region: 'eu-west-1'
});

// Your EC2 instances
const instances = [
  { id: 'i-0effb7ee910fc6c71', name: 'Instance 1' },
  { id: 'i-0eb6f7ffdeda3e8ed', name: 'Instance 2' }
];

// Your Load Balancer + Target Group
const LOAD_BALANCER = 'app/demo-lb/1fd7f49ebb19eb41';
const TARGET_GROUP = 'targetgroup/demo-tg/8da016142d8a8315';

// Helper: fetch + sort CloudWatch data
async function getMetric(params) {
  const result = await cloudwatch.getMetricStatistics(params).promise();

  return result.Datapoints.sort(
    (a, b) => new Date(a.Timestamp) - new Date(b.Timestamp)
  );
}

// ----------------------
// Routes
// ----------------------

// Test
app.get('/', (req, res) => {
  res.send('Backend running');
});

// Instances
app.get('/instances', (req, res) => {
  res.json(instances);
});

// ----------------------
// CPU
// ----------------------
app.get('/cpu', async (req, res) => {
  const instanceId = req.query.instanceId;

  const params = {
    Namespace: 'AWS/EC2',
    MetricName: 'CPUUtilization',
    Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
    StartTime: new Date(Date.now() - 3600000),
    EndTime: new Date(),
    Period: 300,
    Statistics: ['Average']
  };

  try {
    const data = await getMetric(params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err);
  }
});

// ----------------------
// NETWORK
// ----------------------
app.get('/network', async (req, res) => {
  const instanceId = req.query.instanceId;

  try {
    const inData = await getMetric({
      Namespace: 'AWS/EC2',
      MetricName: 'NetworkIn',
      Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
      StartTime: new Date(Date.now() - 3600000),
      EndTime: new Date(),
      Period: 300,
      Statistics: ['Average']
    });

    const outData = await getMetric({
      Namespace: 'AWS/EC2',
      MetricName: 'NetworkOut',
      Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
      StartTime: new Date(Date.now() - 3600000),
      EndTime: new Date(),
      Period: 300,
      Statistics: ['Average']
    });

    res.json({ inData, outData });

  } catch (err) {
    res.status(500).send(err);
  }
});

// ----------------------
// ALB REQUEST COUNT
// ----------------------
app.get('/alb-requests', async (req, res) => {
  try {
    const data = await getMetric({
      Namespace: 'AWS/ApplicationELB',
      MetricName: 'RequestCount',
      Dimensions: [
        {
          Name: 'LoadBalancer',
          Value: LOAD_BALANCER
        }
      ],
      StartTime: new Date(Date.now() - 3600000),
      EndTime: new Date(),
      Period: 300,
      Statistics: ['Sum']
    });

    res.json(data);
  } catch (err) {
    res.status(500).send(err);
  }
});

// ----------------------
// HEALTH (Healthy vs Unhealthy)
// ----------------------
app.get('/health', async (req, res) => {
  try {
    const healthy = await getMetric({
      Namespace: 'AWS/ApplicationELB',
      MetricName: 'HealthyHostCount',
      Dimensions: [
        { Name: 'LoadBalancer', Value: LOAD_BALANCER },
        { Name: 'TargetGroup', Value: TARGET_GROUP }
      ],
      StartTime: new Date(Date.now() - 3600000),
      EndTime: new Date(),
      Period: 300,
      Statistics: ['Average']
    });

    const unhealthy = await getMetric({
      Namespace: 'AWS/ApplicationELB',
      MetricName: 'UnHealthyHostCount',
      Dimensions: [
        { Name: 'LoadBalancer', Value: LOAD_BALANCER },
        { Name: 'TargetGroup', Value: TARGET_GROUP }
      ],
      StartTime: new Date(Date.now() - 3600000),
      EndTime: new Date(),
      Period: 300,
      Statistics: ['Average']
    });

    res.json({ healthy, unhealthy });

  } catch (err) {
    res.status(500).send(err);
  }
});

// ----------------------
// LATENCY
// ----------------------
app.get('/latency', async (req, res) => {
  try {
    const data = await getMetric({
      Namespace: 'AWS/ApplicationELB',
      MetricName: 'TargetResponseTime',
      Dimensions: [
        {
          Name: 'LoadBalancer',
          Value: LOAD_BALANCER
        }
      ],
      StartTime: new Date(Date.now() - 3600000),
      EndTime: new Date(),
      Period: 300,
      Statistics: ['Average']
    });

    res.json(data);
  } catch (err) {
    res.status(500).send(err);
  }
});

// ----------------------

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
