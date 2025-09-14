from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, List
from ...db import get_db
from ...models.user import User
from ...models.microvm import MicroVMStatus
from ...schemas.microvm import (
    MicroVMCreate, MicroVMUpdate, MicroVMResponse, MicroVMListResponse,
    MicroVMCreateResponse, MicroVMStatusResponse, MicroVMRuntimeTemplate,
    MicroVMRegion, MicroVMEventResponse
)
from ...services.microvm_service import MicroVMService
from ...services.auth_service import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/microvms", response_model=MicroVMCreateResponse)
async def create_microvm(
    microvm_data: MicroVMCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new MicroVM"""
    try:
        microvm_service = MicroVMService(db)
        
        # Get user's primary tenant (simplified for now)
        tenant_id = current_user.id  # In real implementation, get from user's tenant
        
        microvm = await microvm_service.create_microvm(
            microvm_data, 
            current_user.id, 
            tenant_id
        )
        
        return MicroVMCreateResponse(
            id=microvm.id,
            vm_id=microvm.vm_id,
            status=microvm.status,
            dev_url=microvm.dev_url,
            message=f"MicroVM {microvm.vm_id} is being created. This may take up to 45 seconds."
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create MicroVM: {e}")
        raise HTTPException(status_code=500, detail="Failed to create MicroVM")

@router.get("/microvms", response_model=MicroVMListResponse)
async def list_microvms(
    tenant_id: Optional[int] = Query(None),
    status: Optional[MicroVMStatus] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List MicroVMs for the current user"""
    try:
        microvm_service = MicroVMService(db)
        result = await microvm_service.list_microvms(
            current_user.id,
            tenant_id=tenant_id,
            status=status,
            page=page,
            per_page=per_page
        )
        
        return MicroVMListResponse(
            microvms=result["microvms"],
            total=result["total"],
            page=result["page"],
            per_page=result["per_page"],
            total_pages=result["total_pages"]
        )
        
    except Exception as e:
        logger.error(f"Failed to list MicroVMs: {e}")
        raise HTTPException(status_code=500, detail="Failed to list MicroVMs")

@router.get("/microvms/{microvm_id}", response_model=MicroVMResponse)
async def get_microvm(
    microvm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific MicroVM"""
    try:
        microvm_service = MicroVMService(db)
        microvm = await microvm_service.get_microvm(microvm_id, current_user.id)
        
        if not microvm:
            raise HTTPException(status_code=404, detail="MicroVM not found")
        
        return microvm
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get MicroVM {microvm_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get MicroVM")

@router.put("/microvms/{microvm_id}", response_model=MicroVMResponse)
async def update_microvm(
    microvm_id: int,
    microvm_data: MicroVMUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a MicroVM"""
    try:
        microvm_service = MicroVMService(db)
        microvm = await microvm_service.update_microvm(
            microvm_id, 
            microvm_data, 
            current_user.id
        )
        
        if not microvm:
            raise HTTPException(status_code=404, detail="MicroVM not found")
        
        return microvm
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update MicroVM {microvm_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update MicroVM")

@router.delete("/microvms/{microvm_id}")
async def delete_microvm(
    microvm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a MicroVM"""
    try:
        microvm_service = MicroVMService(db)
        success = await microvm_service.delete_microvm(microvm_id, current_user.id)
        
        if not success:
            raise HTTPException(status_code=404, detail="MicroVM not found")
        
        return {"message": "MicroVM deletion initiated"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete MicroVM {microvm_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete MicroVM")

@router.get("/microvms/{microvm_id}/status", response_model=MicroVMStatusResponse)
async def get_microvm_status(
    microvm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get MicroVM status and metrics"""
    try:
        microvm_service = MicroVMService(db)
        status_data = await microvm_service.get_microvm_status(microvm_id, current_user.id)
        
        if not status_data:
            raise HTTPException(status_code=404, detail="MicroVM not found")
        
        return status_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get MicroVM status {microvm_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get MicroVM status")

@router.get("/microvms/{microvm_id}/events", response_model=List[MicroVMEventResponse])
async def get_microvm_events(
    microvm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get MicroVM events"""
    try:
        # Verify user owns the MicroVM
        microvm_service = MicroVMService(db)
        microvm = await microvm_service.get_microvm(microvm_id, current_user.id)
        
        if not microvm:
            raise HTTPException(status_code=404, detail="MicroVM not found")
        
        # Get events
        from ...models.microvm import MicroVMEvent
        events = db.query(MicroVMEvent).filter(
            MicroVMEvent.microvm_id == microvm_id
        ).order_by(MicroVMEvent.created_at.desc()).limit(50).all()
        
        return events
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get MicroVM events {microvm_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get MicroVM events")

@router.get("/microvms/templates/runtimes", response_model=List[MicroVMRuntimeTemplate])
async def get_runtime_templates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get available runtime templates"""
    try:
        microvm_service = MicroVMService(db)
        templates = await microvm_service.get_runtime_templates()
        return templates
        
    except Exception as e:
        logger.error(f"Failed to get runtime templates: {e}")
        raise HTTPException(status_code=500, detail="Failed to get runtime templates")

@router.get("/microvms/templates/regions", response_model=List[MicroVMRegion])
async def get_available_regions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get available regions for MicroVM deployment"""
    try:
        microvm_service = MicroVMService(db)
        regions = await microvm_service.get_available_regions()
        return regions
        
    except Exception as e:
        logger.error(f"Failed to get available regions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get available regions")

@router.post("/microvms/{microvm_id}/start")
async def start_microvm(
    microvm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a stopped MicroVM"""
    try:
        microvm_service = MicroVMService(db)
        microvm = await microvm_service.get_microvm(microvm_id, current_user.id)
        
        if not microvm:
            raise HTTPException(status_code=404, detail="MicroVM not found")
        
        if microvm.status != MicroVMStatus.STOPPED:
            raise HTTPException(status_code=400, detail="MicroVM is not in stopped state")
        
        # TODO: Implement start via vm-control API
        return {"message": "MicroVM start initiated"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start MicroVM {microvm_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to start MicroVM")

@router.post("/microvms/{microvm_id}/stop")
async def stop_microvm(
    microvm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stop a running MicroVM"""
    try:
        microvm_service = MicroVMService(db)
        microvm = await microvm_service.get_microvm(microvm_id, current_user.id)
        
        if not microvm:
            raise HTTPException(status_code=404, detail="MicroVM not found")
        
        if microvm.status != MicroVMStatus.RUNNING:
            raise HTTPException(status_code=400, detail="MicroVM is not in running state")
        
        # TODO: Implement stop via vm-control API
        return {"message": "MicroVM stop initiated"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to stop MicroVM {microvm_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to stop MicroVM")