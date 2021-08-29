import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DateTimeFormatter } from 'js-joda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { GpuPriceTableName } from '@/resources';
import { Gpu } from '@/model/gpu/Gpu';


/**
 * @property primaryKey チップセット_年月(RTX3080_2019_01)
 * @property sortKey メーカ_日(MSI_01)
 */
type GpuInfraItem = {
  readonly primaryKey: string;
  readonly sortKey: string;
  readonly name: string;
  readonly price: number;
  readonly makerCode: string;
  readonly chipset: string;
  readonly createAt: string;
}

export class GpuRepository {

  private readonly client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({})
  }

  async store(gpuPrice: Gpu): Promise<void> {
    await this.client.send(
      new PutCommand({
        Item: {
          ...this.convertToInfraItem(gpuPrice),
        },
        TableName: GpuPriceTableName,
      })
    );
    return Promise.resolve();
  }

  private convertToInfraItem(gpu: Gpu): GpuInfraItem {
    const yearMonth = gpu.createDateTime.format(DateTimeFormatter.ofPattern('yyyy-MM'))
    const day = gpu.createDateTime.dayOfMonth()
      .toString(10)
      .padStart(2, '0');

    return {
      primaryKey: `${gpu.chipset}_${yearMonth}`,
      sortKey: `${gpu.maker.code}_${day}`,
      chipset: gpu.chipset,
      name: gpu.name,
      makerCode: gpu.maker.code,
      price: gpu.price,
      createAt: gpu.createDateTime.format(DateTimeFormatter.ofPattern('yyyy-MM-dd'))
    }

  }
}
