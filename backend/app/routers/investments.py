from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.utils import calculate_investment_metrics

router = APIRouter(prefix="/investments", tags=["investments"])


def _serialize(investment: models.Investment) -> schemas.InvestmentOut:
    metrics = calculate_investment_metrics(
        investment.initial_amount,
        investment.current_value,
        investment.purchase_date,
    )
    return schemas.InvestmentOut(
        id=investment.id,
        name=investment.name,
        type=investment.type,
        symbol=investment.symbol,
        initial_amount=investment.initial_amount,
        current_value=investment.current_value,
        quantity=investment.quantity,
        currency=investment.currency,
        purchase_date=investment.purchase_date,
        notes=investment.notes,
        created_at=investment.created_at,
        updated_at=investment.updated_at,
        total_return=metrics["total_return"],
        return_percentage=metrics["return_percentage"],
        annual_growth_percentage=metrics["annual_growth_percentage"],
    )


@router.get("/", response_model=List[schemas.InvestmentOut])
def list_investments(db: Session = Depends(get_db)):
    items = db.query(models.Investment).order_by(models.Investment.id).all()
    return [_serialize(i) for i in items]


@router.post(
    "/", response_model=schemas.InvestmentOut, status_code=status.HTTP_201_CREATED
)
def create_investment(
    payload: schemas.InvestmentCreate, db: Session = Depends(get_db)
):
    investment = models.Investment(**payload.model_dump())
    db.add(investment)
    db.commit()
    db.refresh(investment)
    return _serialize(investment)


@router.get("/{investment_id}", response_model=schemas.InvestmentOut)
def get_investment(investment_id: int, db: Session = Depends(get_db)):
    investment = (
        db.query(models.Investment)
        .filter(models.Investment.id == investment_id)
        .first()
    )
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    return _serialize(investment)


@router.put("/{investment_id}", response_model=schemas.InvestmentOut)
def update_investment(
    investment_id: int,
    payload: schemas.InvestmentUpdate,
    db: Session = Depends(get_db),
):
    investment = (
        db.query(models.Investment)
        .filter(models.Investment.id == investment_id)
        .first()
    )
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(investment, key, value)
    db.commit()
    db.refresh(investment)
    return _serialize(investment)


@router.delete("/{investment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investment(investment_id: int, db: Session = Depends(get_db)):
    investment = (
        db.query(models.Investment)
        .filter(models.Investment.id == investment_id)
        .first()
    )
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    db.delete(investment)
    db.commit()
    return None
