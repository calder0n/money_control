from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.utils import calculate_account_yield

router = APIRouter(prefix="/accounts", tags=["accounts"])


def _serialize(account: models.Account) -> schemas.AccountOut:
    metrics = calculate_account_yield(
        account.balance,
        account.yield_tier_limit,
        account.yield_tier_rate,
        account.yield_base_rate,
    )
    return schemas.AccountOut(
        id=account.id,
        name=account.name,
        type=account.type,
        currency=account.currency,
        balance=account.balance,
        color=account.color,
        icon=account.icon,
        yield_tier_limit=account.yield_tier_limit,
        yield_tier_rate=account.yield_tier_rate,
        yield_base_rate=account.yield_base_rate,
        created_at=account.created_at,
        updated_at=account.updated_at,
        projected_annual_yield=metrics["projected_annual_yield"],
        effective_yield_rate=metrics["effective_yield_rate"],
    )


@router.get("/", response_model=List[schemas.AccountOut])
def list_accounts(db: Session = Depends(get_db)):
    items = db.query(models.Account).order_by(models.Account.id).all()
    return [_serialize(a) for a in items]


@router.post("/", response_model=schemas.AccountOut, status_code=status.HTTP_201_CREATED)
def create_account(payload: schemas.AccountCreate, db: Session = Depends(get_db)):
    account = models.Account(**payload.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return _serialize(account)


@router.get("/{account_id}", response_model=schemas.AccountOut)
def get_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return _serialize(account)


@router.put("/{account_id}", response_model=schemas.AccountOut)
def update_account(
    account_id: int,
    payload: schemas.AccountUpdate,
    db: Session = Depends(get_db),
):
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(account, key, value)
    db.commit()
    db.refresh(account)
    return _serialize(account)


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(account)
    db.commit()
    return None
