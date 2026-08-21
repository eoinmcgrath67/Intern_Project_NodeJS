const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');

const app = express();
app.use(cors());

// Region (must match your AWS region)
const cloudwatch = new AWS.CloudWatch({
  region: 'eu-west-1'
});

const LOAD_BALANCER = process.env.LOAD_BALANCER;
const TARGET_GROUP = process.env.TARGET_GROUP;

const ec2 = new AWS.EC2({
  region: 'eu-west-1'
});


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
app.get('/instances', async (req, res) => {
  try {
    const result = await ec2.describeInstances({
      Filters: [
        {
          Name: 'instance-state-name',
          Values: ['running']
        }
      ]
    }).promise();

    const instances = [];

    result.Reservations.forEach(reservation => {
      reservation.Instances.forEach(instance => {

        const nameTag =
          instance.Tags?.find(tag => tag.Key === 'Name');

        instances.push({
          id: instance.InstanceId,
          name: nameTag?.Value || instance.InstanceId
        });
      });
    });

    res.json(instances);

  } catch (err) {
    res.status(500).send(err);
  }
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
