import path from 'path';
import { pin } from 'pinsjs/pin';
import host from 'pinsjs/host';
import { boardRegister, boardList, boardGet } from 'pinsjs/board';
import { boardVersionsEnabled } from 'pinsjs/versions';
import { boardDefaultSuite, boardVersionsSuite } from './suites/board';

const textFilePath = path.resolve('fixtures', 'files', 'hello.txt');

describe('local board', () => {
  describe('default', () => {
    test.skip('can pin() file with auto-generated name', () => {
      const cachedPath = pin(textFilePath, { board: 'local' });

      expect(typeof cachedPath === 'string').toBe(true);
      expect(host.readLines(cachedPath)).toBe('hello world');
    });

    test.skip('can be registered', () => {
      boardRegister('local', { cache: host.tempfile() });
      expect(boardList().includes('local')).toBe(true);
    });
  });

  describe('versions', () => {
    test.skip('can be registered', () => {
      boardRegister('local', { cache: host.tempfile(), versions: true });
      expect(boardList().includes('local')).toBe(true);
      expect(boardVersionsEnabled(boardGet('local'))).toBe(true);
    });
  });
});

boardDefaultSuite('local');
boardVersionsSuite('local');
