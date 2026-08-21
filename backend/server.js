const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');

const app = express();
app.use(cors());

// Region (must match your AWS region)
const cloudwatch = new AWS.CloudWatch({
  region: 'eu-west-1'
});


const ec2 = new AWS.EC2({
  region: 'eu-west-1'
});

const elbv2 = new AWS.ELBv2({
  region: 'eu-west-1'
});

async function getAlbInfo() {
  const loadBalancers = await elbv2.describeLoadBalancers().promise();

  const alb = loadBalancers.LoadBalancers.find(
    lb => lb.LoadBalancerName === 'dev-alb'
  );

  const targetGroups = await elbv2.describeTargetGroups().promise();

  const tg = targetGroups.TargetGroups.find(
    tg => tg.TargetGroupName === 'dev-backend-tg'
  );

  return {
  loadBalancer: alb.LoadBalancerArn.split('loadbalancer/')[1],
  targetGroup: `targetgroup/${tg.TargetGroupName}/${tg.TargetGroupArn.split('/').pop()}`
  };
}

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
    const { loadBalancer } = await getAlbInfo();

    const data = await getMetric({
      Namespace: 'AWS/ApplicationELB',
      MetricName: 'RequestCount',
      Dimensions: [
        {
          Name: 'LoadBalancer',
          Value: loadBalancer
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

app.get('/health', async (req, res) => {
  try {
    const { loadBalancer, targetGroup } = await getAlbInfo();

    const healthy = await getMetric({
      Namespace: 'AWS/ApplicationELB',
      MetricName: 'HealthyHostCount',
      Dimensions: [
        {
          Name: 'LoadBalancer',
          Value: loadBalancer
        },
        {
          Name: 'TargetGroup',
          Value: targetGroup
        }
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
        {
          Name: 'LoadBalancer',
          Value: loadBalancer
        },
        {
          Name: 'TargetGroup',
          Value: targetGroup
        }
      ],
      StartTime: new Date(Date.now() - 3600000),
      EndTime: new Date(),
      Period: 300,
      Statistics: ['Average']
    });

    res.json({
      healthy,
      unhealthy
    });

  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/latency', async (req, res) => {
  try {
    const { loadBalancer } = await getAlbInfo();

    const data = await getMetric({
      Namespace: 'AWS/ApplicationELB',
      MetricName: 'TargetResponseTime',
      Dimensions: [
        {
          Name: 'LoadBalancer',
          Value: loadBalancer
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
