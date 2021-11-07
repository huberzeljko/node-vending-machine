import { PagedSearchResultDto } from 'src/common';
import { ProductDto } from './product.dto';

export class ProductSearchResultDto extends PagedSearchResultDto(ProductDto) {}
