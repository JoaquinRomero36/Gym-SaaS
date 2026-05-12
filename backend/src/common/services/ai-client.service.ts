import { HttpException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { ChurnFeatures, ChurnResult } from '../../risk/risk.types';

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);
  private readonly aiUrl: string;
  private enabled = true;

  constructor(
    private readonly httpService: HttpService,
    config: ConfigService,
  ) {
    this.aiUrl = config.get('AI_SERVICE_URL', 'http://localhost:8000');
  }

  disable(): void {
    this.enabled = false;
    this.logger.warn('AI Service client disabled — using local fallback');
  }

  async predictChurn(features: ChurnFeatures): Promise<ChurnResult | null> {
    if (!this.enabled) return null;

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiUrl}/predict/churn`, features).pipe(
          timeout(5000),
        ),
      );

      const data = response.data;
      return {
        score: data.score,
        category: data.category as ChurnResult['category'],
        features,
      };
    } catch (err) {
      this.logger.warn(`AI Service unavailable for prediction: ${err.message}`);
      return null;
    }
  }

  async predictChurnBatch(featuresList: ChurnFeatures[]): Promise<(ChurnResult | null)[] | null> {
    if (!this.enabled) return null;

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiUrl}/predict/churn/batch`, { users: featuresList }).pipe(
          timeout(15000),
        ),
      );

      return response.data.predictions.map((p: any) => ({
        score: p.score,
        category: p.category as ChurnResult['category'],
        features: featuresList[0], // paired by index
      }));
    } catch (err) {
      this.logger.warn(`AI Service unavailable for batch prediction: ${err.message}`);
      return null;
    }
  }
}