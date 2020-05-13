import * as fileSystem from './host/file-system';

export const boardInitializeLocal = (board, cache, ...args) => {
  if (!fileSystem.dir.exists(board['cache']))
    fileSystem.dir.create(board['cache'], { recursive: true });

  return board;
};

export const guessExtensionFromPath = (path) => {
  if (fileSystem.dir.exists(path)) {
    var allFiles = fileSystem.dir.list(path, { recursive: true });
    allFiles = allFiles.filter((x) => !/data\\.txt/gi.test(x));

    path = allFiles[0];
  }

  fileSystem.tools.fileExt(path);
};

export const boardPinCreateLocal = (board, path, name, metadata, ...args) => {
  boardVersionsCreate(board, (name = name), (path = path));

  var finalPath = pinStoragePath((component = board['name']), (name = name));

  var toDelete = fileSystem.dir.list(final_path, { fullNames: true });
  toDelete = toDelete.filter((e) => /(\/|\\)_versions$/gi.test(e));
  fileSystem.dir.remove(toDelete, { recursive: true });
  if (!fileSystem.dir.exists(finalPath)) fileSystem.dir.create(finalPath);

  fileSystem.copy(fileSystem.dir.list(path, { fullNames: true }), finalPath, {
    recursive: true,
  });

  // reduce index size
  metadata['columns'] = null;

  var basePath = boardLocalStorage(board['name']);

  return pinRegistryUpdate(
    name,
    board['name'],
    Object.assign(
      {
        path: pinRegistryRelative(finalPath, { basePath: basePath }),
      },
      metadata
    )
  );
};

export const boardPinFindLocal = (board, text, ...args) => {
  var results = pinRegistryFind(text, board['name']);

  if (results.length == 1) {
    var metadata = JSON.parse(results['metadata']);
    var path = pinRegistryAbsolute(metadata['path'], {
      component: board['name'],
    });
    var extended = pinManifestGet(path);
    var merged = pinManifestMerge(metadata, extended);

    results['metadata'] = JSON.stringify(merged);
  }

  return results;
};

export const boardPinGetLocal = (board, name, version, ...args) => {
  var path = pinRegistryRetrievePath(name, board['name']);

  if (!checks.isNull(version)) {
    var manifest = pinManifestGet(pinRegistryAbsolute(path, board['name']));

    if (!manifest['versions'].includes(version)) {
      version = boardVersionsExpand(manifest['versions'], version);
    }

    path = fileSystem.path(name, version);
  }

  return pinRegistryAbsolute(path, { component: board['name'] });
};

export const boardPinRemoveLocal = (board, name) => {
  return pinRegistryRemove(name, board['name']);
};

export const boardPinVersionsLocal = (board, name, ...args) => {
  return boardVersionsGet(board, name);
};
