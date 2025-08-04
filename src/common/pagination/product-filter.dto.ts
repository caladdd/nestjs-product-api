import { Transform } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, IsNumber } from 'class-validator';

export class ProductFilterDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt()
  @Min(1)
  limit = 5;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(String(value)))
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(String(value)))
  @IsNumber()
  maxPrice?: number;
}
