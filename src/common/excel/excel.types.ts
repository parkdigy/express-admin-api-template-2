export type ExcelColor =
  | { auto: 1 }
  | {
      rgb: string;
    }
  | { theme: '1'; tint: '-0.25' }
  | { indexed: 64 };

export type ExcelBorderStyle =
  | 'thin'
  | 'medium'
  | 'thick'
  | 'dotted'
  | 'hair'
  | 'dashed'
  | 'mediumDashed'
  | 'dashDot'
  | 'mediumDashDot'
  | 'dashDotDot'
  | 'mediumDashDotDot'
  | 'slantDashDot';

export interface ExcelFill {
  patternType?: 'solid' | 'none';
  fgColor?: ExcelColor;
  bgColor?: ExcelColor;
}

export interface ExcelBorder {
  top?: { style: ExcelBorderStyle; color: ExcelColor };
  bottom?: { style: ExcelBorderStyle; color: ExcelColor };
  left?: { style: ExcelBorderStyle; color: ExcelColor };
  right?: { style: ExcelBorderStyle; color: ExcelColor };
  diagonalUp?: boolean;
  diagonalDown?: boolean;
}

export interface ExcelAlignment {
  vertical?: 'bottom' | 'center' | 'top';
  horizontal?: 'left' | 'center' | 'right';
  wrapText?: boolean;
  /** 2 is "right-to-left" */
  readingOrder?: number;
  /** 0-180 or 255 */
  textRotation?: number;
  indent?: number;
}

export interface ExcelFont {
  name?: string;
  sz?: string;
  color?: ExcelColor;
  bold?: boolean;
  underline?: boolean;
  italic?: boolean;
  strike?: boolean;
  outline?: boolean;
  shadow?: boolean;
  vertAlign?: boolean;
}

export interface ExcelStyle {
  fill?: ExcelFill;
  font?: ExcelFont;
  /**
   * Formating of number. Some examples: (see StyleBuilder.SSF property for more)
   * "0"
   * "0.00%"
   * "0.0%"
   * "0.00%;\\(0.00%\\);\\-;@"
   * "m/dd/yy"
   */
  numFmt?: string;
  alignment?: ExcelAlignment;
  border?: ExcelBorder;
}

export type ExcelColumnOptionAlign = 'l' | 'c' | 'r';
export type ExcelColumnSum = string | boolean;
export type ExcelColumnOnValueReturn = string | number | null | undefined | false;

/** Footer 셀은 왼쪽부터 순서대로 배치하며 colSpan만큼 컬럼을 차지한다. */
export interface ExcelFooterCell {
  value: string | number;
  colSpan?: number;
  align?: ExcelColumnOptionAlign;
  format?: string;
  style?: ExcelStyle;
}

export interface ExcelExportOptions {
  /** 기존 sum 합계 행 다음에 추가할 footer 행들 */
  footer?: (string | number | ExcelFooterCell)[][];
  /** 기본 합계 스타일에 덧붙일 footer 공통 스타일 */
  footerStyle?: ExcelStyle;
}

export interface ExcelColumnOption<T, Name extends keyof T | undefined> {
  title: string | string[];
  name?: Name;
  width?: number;
  align?: ExcelColumnOptionAlign;
  format?: string;
  headerStyle?: ExcelStyle;
  dataStyle?: ExcelStyle;
  sum?: ExcelColumnSum;
  sumStyle?: ExcelStyle;
  onValue?: Name extends keyof T
    ? (value: T[Name], info: T) => ExcelColumnOnValueReturn
    : (info: T) => ExcelColumnOnValueReturn;
  onCellOptions?: (info: T) => ExcelColumnCellOption<T, Name> | void | undefined | false;
}

export type ExcelColumnParamOption<T, Name extends keyof T | undefined> = Omit<
  ExcelColumnOption<T, Name>,
  'title' | 'name' | 'width' | 'align' | 'onValue' | 'onOptions'
>;

export type ExcelColumnCellOption<T, Name extends keyof T | undefined> = Omit<
  ExcelColumnOption<T, Name>,
  'title' | 'name' | 'width' | 'align' | 'headerStyle' | 'sum' | 'sumStyle' | 'onValue' | 'onOptions'
>;

/** 기본 Column 설정 */
const $defaultColumnOptions: Partial<ExcelColumnOption<any, any>> = {
  width: 20,
  align: 'l',
};

/** Column 클래스 */
export class ExcelColumn<T, Name extends keyof T | undefined> {
  $options: ExcelColumnOption<T, Name>;

  constructor(options: ExcelColumnOption<T, Name>) {
    this.$options = { ...$defaultColumnOptions, ...(options || {}) } as ExcelColumnOption<T, Name>;
  }

  getOptions(): ExcelColumnOption<T, Name> {
    return this.$options;
  }
}
