import '../../src/init/global.types';
import excel from '../../src/common/excel';
import xlsx from 'sheetjs-style';

describe('excel', () => {
  let res: MyResponse;

  beforeEach(() => {
    res = {
      attachment: jest.fn(() => res),
      send: jest.fn(),
    } as unknown as MyResponse;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should export Excel with correct data', () => {
    const fileName = 'test.xlsx';
    const rawData = [
      { name: 'John', age: 25, city: 'New York' },
      { name: 'Jane', age: 30, city: 'London' },
    ];
    excel.export(res, fileName, rawData, [
      excel.newColumn('Name', 'name'),
      excel.newColumn('Age', 'age'),
      excel.newColumn('City', 'city'),
    ]);

    expect(res.attachment).toHaveBeenCalledWith(fileName);
    expect(res.send).toHaveBeenCalled();
  });

  it('exports column header arrays as rows above the data', () => {
    excel.export(
      res,
      'test.xlsx',
      [{ reg_no: '106-81-86362', client_name: '인포바인', amount: 100 }],
      [
        excel.newColumn(['거래처등록번호', 'A'], 'reg_no', 18, 'c'),
        excel.newColumn(['거래처', 'B'], 'client_name', 30, 'l'),
        excel.newColumn(['금액', 'C', '원'], 'amount', 18, 'r', undefined, { sum: true }),
      ]
    );

    const buffer = (res.send as jest.Mock).mock.calls[0][0];
    const workbook = xlsx.read(buffer, { type: 'buffer', cellFormula: true, sheetStubs: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    expect(xlsx.utils.sheet_to_json(sheet, { header: 1 }).slice(0, 4)).toEqual([
      ['거래처등록번호', '거래처', '금액'],
      ['A', 'B', 'C'],
      ['', '', '원'],
      ['106-81-86362', '인포바인', 100],
    ]);
    expect(sheet.C5.f).toBe('SUM(C4:C4)');
  });

  it.each(['Name', ['Name', 'A']])('exports mixed string and array headers with first title %j', (title) => {
    excel.export(
      res,
      'test.xlsx',
      [{ name: 'John', age: 25 }],
      [excel.newColumn(title, 'name'), excel.newColumn(['Age', 'B'], 'age')]
    );

    const buffer = (res.send as jest.Mock).mock.calls[0][0];
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    expect(xlsx.utils.sheet_to_json(sheet, { header: 1 })).toEqual([
      ['Name', 'Age'],
      [Array.isArray(title) ? 'A' : '', 'B'],
      ['John', 25],
    ]);
  });

  it('merges adjacent equal headers while keeping subheaders and data separate', () => {
    excel.export(
      res,
      'test.xlsx',
      [{ reg_no: '106-81-86362', client_id: 1, client_name: '인포바인', date: '2026-09-17' }],
      [
        excel.newColumn(['거래처등록번호', 'A'], 'reg_no'),
        excel.newColumn(['거래처', 'ID'], 'client_id'),
        excel.newColumn(['거래처', '이름'], 'client_name'),
        excel.newColumn(['작성일자', '이름'], 'date'),
      ]
    );

    const workbook = xlsx.read((res.send as jest.Mock).mock.calls[0][0], { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    expect(sheet['!merges']).toEqual([xlsx.utils.decode_range('B1:C1')]);
    expect(xlsx.utils.sheet_to_json(sheet, { header: 1 })).toEqual([
      ['거래처등록번호', '거래처', '', '작성일자'],
      ['A', 'ID', '이름', '이름'],
      ['106-81-86362', 1, '인포바인', '2026-09-17'],
    ]);
  });

  it('merges runs on each header row, excluding blanks and separated equal titles', () => {
    excel.export(
      res,
      'test.xlsx',
      [],
      [
        excel.newColumn(['그룹', '합계']),
        excel.newColumn(['그룹', '합계']),
        excel.newColumn(['그룹', '합계']),
        excel.newColumn('구분'),
        excel.newColumn('그룹'),
      ]
    );

    const workbook = xlsx.read((res.send as jest.Mock).mock.calls[0][0], { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    expect(sheet['!merges']).toEqual(['A1:C1', 'A2:C2', 'D1:D2', 'E1:E2'].map(xlsx.utils.decode_range));
    expect(sheet.E1.v).toBe('그룹');
  });

  it('does not merge equal titles when all column titles are strings', () => {
    excel.export(
      res,
      'test.xlsx',
      [{ reg_no: '106-81-86362', client_id: 1 }],
      [excel.newColumn('이름', 'reg_no', 18, 'c'), excel.newColumn('이름', 'client_id', 18, 'c')]
    );

    const workbook = xlsx.read((res.send as jest.Mock).mock.calls[0][0], { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    expect(sheet['!merges']).toBeUndefined();
    expect(xlsx.utils.sheet_to_json(sheet, { header: 1 })).toEqual([
      ['이름', '이름'],
      ['106-81-86362', 1],
    ]);
  });

  it.each([2, 3])(
    'merges string headers vertically across %i header rows without overlapping horizontal merges',
    (rows) => {
      const idTitle = rows === 2 ? ['거래처', 'ID'] : ['거래처', 'ID', '번호'];
      const nameTitle = rows === 2 ? ['거래처', '이름'] : ['거래처', '이름', '상호'];
      excel.export(
        res,
        'test.xlsx',
        [],
        [
          excel.newColumn('거래처등록번호'),
          excel.newColumn(idTitle),
          excel.newColumn(nameTitle),
          excel.newColumn('작성일자'),
          excel.newColumn('작성일자'),
        ]
      );

      const workbook = xlsx.read((res.send as jest.Mock).mock.calls[0][0], { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      expect(sheet['!merges']).toEqual(
        ['B1:C1', `A1:A${rows}`, `D1:D${rows}`, `E1:E${rows}`].map(xlsx.utils.decode_range)
      );
      expect(sheet.A1.v).toBe('거래처등록번호');
      expect(sheet.D1.v).toBe('작성일자');
      expect(sheet.E1.v).toBe('작성일자');
      expect(sheet.B2.v).toBe('ID');
      expect(sheet.C2.v).toBe('이름');
    }
  );

  it('merges the last title of shorter array headers vertically', () => {
    excel.export(
      res,
      'test.xlsx',
      [],
      [
        excel.newColumn('거래처등록번호'),
        excel.newColumn(['거래처', 'ID', 'A']),
        excel.newColumn(['거래처', 'ID', 'B']),
        excel.newColumn(['거래처', '이름']),
        excel.newColumn('작성일자'),
      ]
    );

    const workbook = xlsx.read((res.send as jest.Mock).mock.calls[0][0], { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    expect(sheet['!merges']).toEqual(['B1:D1', 'B2:C2', 'D2:D3', 'A1:A3', 'E1:E3'].map(xlsx.utils.decode_range));
    expect(sheet.D2.v).toBe('이름');
    expect(sheet.B3.v).toBe('A');
    expect(sheet.C3.v).toBe('B');
  });

  it('combines horizontal and vertical merges without overlapping deeper headers', () => {
    excel.export(
      res,
      'test.xlsx',
      [],
      [
        excel.newColumn(['거래처', '이름']),
        excel.newColumn(['거래처', '이름']),
        excel.newColumn(['거래처', '이름', '상호']),
      ]
    );

    const workbook = xlsx.read((res.send as jest.Mock).mock.calls[0][0], { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    expect(sheet['!merges']).toEqual(['A1:C1', 'A2:B3'].map(xlsx.utils.decode_range));
    expect(sheet.C2.v).toBe('이름');
    expect(sheet.C3.v).toBe('상호');
  });

  it('exports footer rows with merged cells after the existing sum row', () => {
    const write = jest.spyOn(xlsx, 'write');
    excel.export(
      res,
      'test.xlsx',
      [{ id: 1, name: '인포바인', amount: 100 }],
      [
        excel.newColumn(['거래처', 'ID'], 'id'),
        excel.newColumn(['거래처', '이름'], 'name'),
        excel.newColumn('금액', 'amount', 18, 'r', undefined, { sum: true }),
      ],
      {
        footer: [
          [
            { value: '합계', align: 'c' },
            { value: '발행금액: 100원', colSpan: 2 },
          ],
          [
            { value: '총액', colSpan: 2 },
            { value: 100, align: 'r', format: '#,##0' },
          ],
        ],
        footerStyle: { fill: { fgColor: { rgb: 'ffbfbfbf' } } },
      }
    );

    const workbook = xlsx.read((res.send as jest.Mock).mock.calls[0][0], {
      type: 'buffer',
      sheetStubs: true,
    });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    expect(sheet['!merges']).toEqual(['A1:B1', 'C1:C2', 'B5:C5', 'A6:B6'].map(xlsx.utils.decode_range));
    expect(sheet.C4.f).toBe('SUM(C3:C3)');
    expect(sheet.A5.v).toBe('합계');
    expect(sheet.B5.v).toBe('발행금액: 100원');
    expect(sheet.C6.v).toBe(100);
    expect(sheet.C6.t).toBe('n');
    expect(sheet['!ref']).toBe('A1:C6');

    const styledSheet = write.mock.calls[0][0].Sheets.SheetJS;
    expect(styledSheet.A5.s.alignment.horizontal).toBe('center');
    expect(styledSheet.B5.s.alignment.horizontal).toBe('left');
    expect(styledSheet.C6.s.numFmt).toBe('#,##0');
    expect(styledSheet.C5.s.fill.fgColor.rgb).toBe('ffbfbfbf');
  });

  it('exports a footer without data or a sum row', () => {
    excel.export(res, 'test.xlsx', [], [excel.newColumn('이름'), excel.newColumn('금액')], {
      footer: [['합계', 0], [{ value: '조회 결과 없음', colSpan: 2 }]],
    });
    const workbook = xlsx.read((res.send as jest.Mock).mock.calls[0][0], { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    expect(xlsx.utils.sheet_to_json(sheet, { header: 1 })).toEqual([
      ['이름', '금액'],
      ['합계', 0],
      ['조회 결과 없음', ''],
    ]);
    expect(sheet['!merges']).toEqual([xlsx.utils.decode_range('A3:B3')]);
  });

  it.each([0, -1, 1.5, 3])('rejects invalid footer colSpan %s before sending the file', (colSpan) => {
    expect(() =>
      excel.export(res, 'test.xlsx', [], [excel.newColumn('이름'), excel.newColumn('금액')], {
        footer: [[{ value: '합계', colSpan }]],
      })
    ).toThrow('Excel footer colSpan');
    expect(res.send).not.toHaveBeenCalled();
  });

  it('keeps lower header merges inside all ancestor groups', () => {
    excel.export(
      res,
      'test.xlsx',
      [],
      [
        excel.newColumn(['거래처', '정보', '이름']),
        excel.newColumn(['거래처', '정보', '이름']),
        excel.newColumn(['작성일자', '정보', '이름']),
        excel.newColumn(['작성일자', '정보', '이름']),
        excel.newColumn(['작성일자', '기타', '이름']),
      ]
    );

    const workbook = xlsx.read((res.send as jest.Mock).mock.calls[0][0], { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    expect(sheet['!merges']).toEqual(
      ['A1:B1', 'C1:E1', 'A2:B2', 'C2:D2', 'A3:B3', 'C3:D3'].map(xlsx.utils.decode_range)
    );
    expect(sheet.E3.v).toBe('이름');
  });
});
