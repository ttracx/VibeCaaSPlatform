"""
NVIDIA Cloud Integration Module
Handles GPU resource provisioning and management
"""

import os
import requests
import json
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum

class GPUType(Enum):
    RTX_4090 = "RTX_4090"
    A100 = "A100"
    H100 = "H100"
    V100 = "V100"

@dataclass
class GPUResource:
    id: str
    type: GPUType
    memory: str
    cores: int
    status: str
    region: str
    price_per_hour: float

@dataclass
class GPUAllocation:
    allocation_id: str
    gpu_id: str
    app_id: str
    user_id: str
    allocated_at: str
    region: str

class NVIDIACloudClient:
    def __init__(self, api_key: str, project_id: str, region: str = "us-west-1"):
        self.api_key = api_key
        self.project_id = project_id
        self.region = region
        self.base_url = "https://api.nvidia.com/v1"
        
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "X-Project-ID": project_id
        }
    
    def list_available_gpus(self, gpu_type: Optional[GPUType] = None) -> List[GPUResource]:
        """List available GPU resources"""
        params = {"region": self.region}
        if gpu_type:
            params["type"] = gpu_type.value
        
        try:
            response = requests.get(
                f"{self.base_url}/compute/gpu/available",
                headers=self.headers,
                params=params
            )
            response.raise_for_status()
            
            gpus = []
            for gpu_data in response.json().get("gpus", []):
                gpus.append(GPUResource(
                    id=gpu_data["id"],
                    type=GPUType(gpu_data["type"]),
                    memory=gpu_data["memory"],
                    cores=gpu_data["cores"],
                    status=gpu_data["status"],
                    region=gpu_data["region"],
                    price_per_hour=gpu_data["price_per_hour"]
                ))
            
            return gpus
        except requests.RequestException as e:
            print(f"Error fetching GPU resources: {e}")
            return []
    
    def allocate_gpu(self, gpu_id: str, app_id: str, user_id: str) -> Optional[GPUAllocation]:
        """Allocate a GPU resource for an application"""
        payload = {
            "gpu_id": gpu_id,
            "app_id": app_id,
            "user_id": user_id,
            "region": self.region
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/compute/gpu/allocate",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            
            allocation_data = response.json()
            return GPUAllocation(
                allocation_id=allocation_data["allocation_id"],
                gpu_id=allocation_data["gpu_id"],
                app_id=allocation_data["app_id"],
                user_id=allocation_data["user_id"],
                allocated_at=allocation_data["allocated_at"],
                region=allocation_data["region"]
            )
        except requests.RequestException as e:
            print(f"Error allocating GPU: {e}")
            return None
    
    def deallocate_gpu(self, allocation_id: str) -> bool:
        """Deallocate a GPU resource"""
        try:
            response = requests.delete(
                f"{self.base_url}/compute/gpu/allocate/{allocation_id}",
                headers=self.headers
            )
            response.raise_for_status()
            return True
        except requests.RequestException as e:
            print(f"Error deallocating GPU: {e}")
            return False
    
    def get_gpu_metrics(self, allocation_id: str) -> Dict:
        """Get GPU utilization metrics"""
        try:
            response = requests.get(
                f"{self.base_url}/compute/gpu/metrics/{allocation_id}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error fetching GPU metrics: {e}")
            return {}
    
    def scale_gpu_allocation(self, allocation_id: str, new_gpu_count: int) -> bool:
        """Scale GPU allocation for an application"""
        payload = {
            "gpu_count": new_gpu_count
        }
        
        try:
            response = requests.put(
                f"{self.base_url}/compute/gpu/scale/{allocation_id}",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return True
        except requests.RequestException as e:
            print(f"Error scaling GPU allocation: {e}")
            return False

# Example usage
if __name__ == "__main__":
    # Initialize client
    client = NVIDIACloudClient(
        api_key=os.getenv("NVIDIA_CLOUD_API_KEY"),
        project_id=os.getenv("NVIDIA_CLOUD_PROJECT_ID"),
        region="us-west-1"
    )
    
    # List available GPUs
    gpus = client.list_available_gpus()
    print(f"Available GPUs: {len(gpus)}")
    
    # Allocate a GPU
    if gpus:
        allocation = client.allocate_gpu(
            gpu_id=gpus[0].id,
            app_id="test-app-123",
            user_id="user-456"
        )
        if allocation:
            print(f"GPU allocated: {allocation.allocation_id}")
            
            # Get metrics
            metrics = client.get_gpu_metrics(allocation.allocation_id)
            print(f"GPU metrics: {metrics}")
            
            # Deallocate when done
            client.deallocate_gpu(allocation.allocation_id)