//app/api/deployments/route.ts
import { NextResponse } from 'next/server';
import { trackDeployment, addDeploymentToUser, updateDeploymentStatus, getDeployment } from '@/lib/redis-utils';
import { deployAimToNode } from '@/lib/hypercycle/deploymentService';

// Create a new deployment
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, aimId, hyperboxId, nodeUrl, image } = data;
    
    if (!userId || !aimId || !hyperboxId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, aimId, and hyperboxId are required' }, 
        { status: 400 }
      );
    }
    
    // Generate a deployment ID
    const deploymentId = `deploy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create deployment record
    const deployment = {
      id: deploymentId,
      userId,
      aimId,
      hyperboxId,
      status: 'pending', // initial status
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store in Redis
    await trackDeployment(deploymentId, deployment);
    await addDeploymentToUser(userId, deploymentId);
    
    // Kick off real deployment if nodeUrl and image are provided
    if (nodeUrl && image) {
      // fire and forget – do not block the HTTP response
      (async () => {
        const res = await deployAimToNode({ nodeUrl, image });
        const newStatus = res.success ? 'running' : 'error';
        await updateDeploymentStatus(deploymentId, newStatus);
      })();
    }
    
    return NextResponse.json({ deployment });
  } catch (error: any) {
    console.error('Error creating deployment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update a deployment status
export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { deploymentId, status } = data;
    
    if (!deploymentId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: deploymentId and status are required' }, 
        { status: 400 }
      );
    }
    
    // Get current deployment
    const deployment = await getDeployment(deploymentId);
    
    if (!deployment) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 });
    }
    
    // Update status
    await updateDeploymentStatus(deploymentId, status);
    
    // Get updated deployment
    const updatedDeployment = await getDeployment(deploymentId);
    
    return NextResponse.json({ deployment: updatedDeployment });
  } catch (error: any) {
    console.error('Error updating deployment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 