from dataclasses import dataclass
from typing import Optional, List, Dict
from decimal import Decimal
import math

@dataclass
class CompoundPeriod:
    """複利計算の期間を表すデータクラス"""
    years: int
    months: int = 0
    
    def to_years(self) -> float:
        """期間を年数に変換"""
        return self.years + (self.months / 12)

class CompoundCalculator:
    """複利計算エンジン"""
    
    def __init__(self):
        # 計算の精度を保つためにDecimalを使用
        self.decimal_places = 2
    
    def calculate_future_value(
        self,
        principal: Decimal,
        annual_interest_rate: Decimal,
        period: CompoundPeriod,
        monthly_deposit: Decimal = Decimal('0'),
        compounds_per_year: int = 12
    ) -> Dict[str, Decimal]:
        """
        将来価値を計算する

        Args:
            principal: 元金
            annual_interest_rate: 年利率（パーセント）
            period: 運用期間
            monthly_deposit: 毎月の積立額（オプション）
            compounds_per_year: 年間の複利計算回数（デフォルト：12回）

        Returns:
            Dict containing:
            - future_value: 将来価値
            - total_interest: 利息合計
            - total_deposits: 積立総額
        """
        
        # 入力値の検証
        if principal < 0 or annual_interest_rate < 0 or monthly_deposit < 0:
            raise ValueError("Negative values are not allowed")
        
        # 年利率をDecimalに変換（100で割って小数に）
        rate = annual_interest_rate / Decimal('100')
        
        # 期間を年数に変換
        years = Decimal(str(period.to_years()))
        
        # 1回あたりの利率を計算
        rate_per_period = rate / Decimal(str(compounds_per_year))
        
        # 総期間の複利計算回数
        n_periods = years * Decimal(str(compounds_per_year))
        
        # 元金の将来価値を計算
        base_future_value = principal * (
            (1 + rate_per_period) ** Decimal(str(math.floor(float(n_periods))))
        )
        
        # 毎月の積立がある場合の追加計算
        if monthly_deposit > 0:
            # 積立による将来価値を計算
            deposit_future_value = monthly_deposit * (
                ((1 + rate_per_period) ** Decimal(str(math.floor(float(n_periods)))) - 1) /
                rate_per_period
            )
        else:
            deposit_future_value = Decimal('0')
        
        # 総将来価値
        total_future_value = base_future_value + deposit_future_value
        
        # 積立総額
        total_deposits = principal + (monthly_deposit * Decimal('12') * years)
        
        # 利息合計
        total_interest = total_future_value - total_deposits
        
        return {
            "future_value": self._round(total_future_value),
            "total_interest": self._round(total_interest),
            "total_deposits": self._round(total_deposits)
        }
    
    def calculate_required_savings(
        self,
        target_amount: Decimal,
        annual_interest_rate: Decimal,
        period: CompoundPeriod,
        initial_principal: Decimal = Decimal('0')
    ) -> Decimal:
        """
        目標額に達するために必要な毎月の積立額を計算する

        Args:
            target_amount: 目標金額
            annual_interest_rate: 年利率（パーセント）
            period: 運用期間
            initial_principal: 初期元金（オプション）

        Returns:
            必要な毎月の積立額
        """
        if target_amount <= initial_principal:
            return Decimal('0')
        
        rate = annual_interest_rate / Decimal('100')
        years = Decimal(str(period.to_years()))
        monthly_rate = rate / Decimal('12')
        n_months = years * Decimal('12')
        
        # 初期元金の将来価値を計算
        principal_future_value = initial_principal * (
            (1 + monthly_rate) ** n_months
        )
        
        # 必要な積立総額
        required_savings = target_amount - principal_future_value
        
        # 毎月の必要積立額を計算
        monthly_savings = required_savings * (
            monthly_rate / 
            ((1 + monthly_rate) ** n_months - 1)
        )
        
        return self._round(monthly_savings)
    
    def _round(self, value: Decimal) -> Decimal:
        """指定された小数点以下の桁数に丸める"""
        return round(value, self.decimal_places)