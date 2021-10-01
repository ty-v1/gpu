import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DateTimeFormatter, LocalDate, LocalTime} from 'js-joda';
import {PutCommand, QueryCommand} from '@aws-sdk/lib-dynamodb';
import {GpuPriceTableName} from '@/resources';
import {Gpu} from '@/model/gpu/Gpu';
import * as crypto from 'crypto';
import {Chipset, Chipsets} from '@/types/Chipset';
import {Maker} from '@/types/Maker';
import {GpuSeller} from '@/types/GpuSeller';


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
  readonly url: string;
  readonly seller: string;
}

export class GpuRepository {

  private readonly client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({});
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

  async find(chipset: Chipset, year: number, month: number): Promise<ReadonlyArray<Gpu>> {
    const yearString = year.toString(10)
      .padStart(4, '0');
    const monthString = month.toString(10)
      .padStart(2, '0');


    const infraItems = [];
    let cursor = undefined;
    do {
      const {Items, LastEvaluatedKey} = await this.client.send(new QueryCommand({
        KeyConditionExpression: 'primaryKey = :pk',
        ExpressionAttributeValues: {
          ':pk': `${chipset}_${yearString}-${monthString}`
        },
        TableName: GpuPriceTableName,
      }));

      infraItems.push(...Items ?? []);
      cursor = LastEvaluatedKey;
    } while (cursor !== undefined);

    return infraItems?.map((e) => this.convertToGpu(e as GpuInfraItem)) ?? [];
  }

  private convertToInfraItem(gpu: Gpu): GpuInfraItem {
    const yearMonth = gpu.createDateTime.format(DateTimeFormatter.ofPattern('yyyy-MM'));
    const day = gpu.createDateTime.dayOfMonth()
      .toString(10)
      .padStart(2, '0');
    const hash = crypto.createHash('md5').update(gpu.name).digest('hex');

    return {
      primaryKey: `${gpu.chipset}_${yearMonth}`,
      sortKey: `${gpu.maker.code}_${gpu.seller}_${day}_${hash}`,
      chipset: gpu.chipset,
      name: gpu.name,
      makerCode: gpu.maker.code,
      price: gpu.price,
      createAt: gpu.createDateTime.format(DateTimeFormatter.ofPattern('yyyy-MM-dd')),
      url: gpu.url,
      seller: gpu.seller,
    };
  }

  private convertToGpu(infraItem: GpuInfraItem): Gpu {
    const maker = Object.entries(Maker)
      .map(([_, e]) => e)
      .find((e) => e.code === infraItem.makerCode);
    if (maker === undefined) {
      throw new Error('maker is not found');
    }

    const chipset = Chipsets.find((e) => e === infraItem.chipset);
    if (chipset === undefined) {
      throw new Error('chipset is not found');
    }

    const seller = Object.entries(GpuSeller)
      .map(([_, e]) => e)
      .find((e) => e === infraItem.seller);
    if (seller === undefined) {
      throw new Error('seller is not found');
    }

    return {
      maker,
      chipset,
      seller,
      name: infraItem.name,
      price: infraItem.price,
      createDateTime: LocalDate.parse(infraItem.createAt, DateTimeFormatter.ofPattern('yyyy-MM-dd'))
        .atTime(LocalTime.of(0, 0, 0)),
      url: infraItem.url
    };
  }
}
