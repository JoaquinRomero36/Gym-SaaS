export interface ChurnFeatures {
    days_since_last_attendance: number;
    weekly_frequency: number;
    tenure_days: number;
    consistency_score: number;
    avg_effort_level: number;
    avg_energy_level: number;
    feedback_count_last_2w: number;
}
export interface ChurnResult {
    score: number;
    category: 'low' | 'medium' | 'high';
    features: ChurnFeatures;
}
