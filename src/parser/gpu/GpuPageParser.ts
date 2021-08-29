import { Gpu } from '@/model/gpu/Gpu';

export interface GpuPageParser {
  parse(content: string): Promise<Gpu>;
}
