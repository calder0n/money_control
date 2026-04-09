from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _apply_transaction_to_balance(
    account: models.Account, amount: float, t_type: models.TransactionType, reverse: bool = False
) -> None:
    sign = -1 if reverse else 1
    if t_type == models.TransactionType.income:
        account.balance += sign * amount
    elif t_type == models.TransactionType.expense:
        account.balance -= sign * amount


@router.get("/", response_model=List[schemas.TransactionOut])
def list_transactions(
    account_id: Optional[int] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(models.Transaction)
    if account_id is not None:
        query = query.filter(models.Transaction.account_id == account_id)
    return query.order_by(models.Transaction.date.desc()).limit(limit).all()


@router.post(
    "/", response_model=schemas.TransactionOut, status_code=status.HTTP_201_CREATED
)
def create_transaction(
    payload: schemas.TransactionCreate, db: Session = Depends(get_db)
):
    account = (
        db.query(models.Account).filter(models.Account.id == payload.account_id).first()
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    transaction = models.Transaction(**payload.model_dump(exclude_none=True))
    _apply_transaction_to_balance(account, transaction.amount, transaction.type)
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("/{transaction_id}", response_model=schemas.TransactionOut)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    tx = (
        db.query(models.Transaction)
        .filter(models.Transaction.id == transaction_id)
        .first()
    )
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    tx = (
        db.query(models.Transaction)
        .filter(models.Transaction.id == transaction_id)
        .first()
    )
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    account = (
        db.query(models.Account).filter(models.Account.id == tx.account_id).first()
    )
    if account:
        _apply_transaction_to_balance(account, tx.amount, tx.type, reverse=True)
    db.delete(tx)
    db.commit()
    return None
