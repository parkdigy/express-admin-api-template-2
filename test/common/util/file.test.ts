import file from '../../../src/common/util/file';

describe('util.file', () => {
  describe('mimeType', () => {
    it('should return the correct MIME type for a given file name', () => {
      const fileName = 'example.jpg';
      const mimeType = file.mimeType(fileName);
      expect(mimeType).toBe('image/jpeg');
    });

    it('should return "application/octet-stream" if the MIME type is not found', () => {
      const fileName = 'unknown.000';
      const mimeType = file.mimeType(fileName);
      expect(mimeType).toBe('application/octet-stream');
    });
  });

  describe('extName', () => {
    it('should return the file extension for a given file name', () => {
      const fileName = 'example.jpg';
      const extName = file.extName(fileName);
      expect(extName).toBe('.jpg');
    });
  });

  describe('mimeTypeExtension', () => {
    it('should return the file extension for a given MIME type', () => {
      const mimeType = 'image/jpeg';
      const extension = file.mimeTypeExtension(mimeType);
      expect(extension).toBe('.jpg');
    });

    it('should return the file extension without a dot if addDot is set to false', () => {
      const mimeType = 'image/jpeg';
      const extension = file.mimeTypeExtension(mimeType, false);
      expect(extension).toBe('jpg');
    });

    it('should return an empty string if the MIME type does not have a corresponding extension', () => {
      const mimeType = 'application/octet-streamwewe';
      const extension = file.mimeTypeExtension(mimeType);
      expect(extension).toBe('');
    });
  });
});
