from .models import Nest, db
from typing import Optional, Dict, Any, List
import uuid

def list_nests(island_id: Optional[str] = None) -> List[Dict[str, Any]]:
    query = Nest.query
    if island_id:
        query = query.filter_by(island_id=island_id)
    
    # Order by newest first
    nests = query.order_by(Nest.created_at.desc()).all()
    return [nest.to_dict() for nest in nests]

def create_nest(data: Dict[str, Any]) -> Dict[str, Any]:
    name = data.get("name", "")
    if not name.startswith("n/"):
        name = "n/" + name

    nest = Nest(
        id=str(uuid.uuid4()),
        island_id=data.get("islandId"),
        name=name,
        description=data.get("description"),
        # Removed "student1", now uses the passed ID
        creator_id=data.get("creatorId") 
    )
    db.session.add(nest)
    db.session.commit()
    return nest.to_dict()

def update_nest(nest_id: str, patch: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    nest = Nest.query.get(nest_id)
    if not nest:
        return None

    if "description" in patch:
        nest.description = patch["description"]

    db.session.commit()
    return nest.to_dict()

def delete_nest(nest_id: str) -> bool:
    nest = Nest.query.get(nest_id)
    if not nest:
        return False

    db.session.delete(nest)
    db.session.commit()
    return True
