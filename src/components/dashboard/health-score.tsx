'use client';

import { HealthScoreResult, HealthFactor } from '@/lib/financial-engine';
import { Shield, CheckCircle2, AlertTriangle, AlertCircle, XCircle, Info } from 'lucide-react';

interface HealthScoreDisplayProps {
  result: HealthScoreResult;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'excellent': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'good': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'fair': return <Info className="h-4 w-4 text-yellow-500" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'danger': return <XCircle className="h-4 w-4 text-red-500" />;
    default: return <Info className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusBarColor(status: string) {
  switch (status) {
    case 'excellent': return 'bg-emerald-500';
    case 'good': return 'bg-green-500';
    case 'fair': return 'bg-yellow-500';
    case 'warning': return 'bg-orange-500';
    case 'danger': return 'bg-red-500';
    default: return 'bg-muted-foreground';
  }
}

function getScoreRingColor(score: number): string {
  if (score >= 85) return 'stroke-emerald-500';
  if (score >= 70) return 'stroke-green-500';
  if (score >= 50) return 'stroke-yellow-500';
  if (score >= 30) return 'stroke-orange-500';
  return 'stroke-red-500';
}

export function HealthScoreDisplay({ result }: HealthScoreDisplayProps) {
  const { score, grade, gradeColor, factors } = result;

  // SVG circular progress
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="border rounded-xl bg-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-base font-medium">Financial Health Score</h3>
      </div>

      {/* Score Circle */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <svg width={size} height={size} className="-rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--muted)"
              strokeWidth={strokeWidth}
            />
            {/* Score arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              className={getScoreRingColor(score)}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>
        <p className={`text-sm font-semibold mt-3 ${gradeColor}`}>{grade}</p>
      </div>

      {/* Factor Breakdown */}
      <div className="space-y-4">
        {factors.map((factor) => (
          <div key={factor.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getStatusIcon(factor.status)}
                <span className="font-medium">{factor.name}</span>
              </div>
              <span className="text-muted-foreground tabular-nums">
                {factor.score}/{factor.maxScore}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getStatusBarColor(factor.status)}`}
                style={{ width: `${factor.percentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{factor.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
