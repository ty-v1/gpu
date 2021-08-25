#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { GpuStack } from '../lib/gpu-stack';

const app = new cdk.App();
new GpuStack(app, 'GpuStack');
