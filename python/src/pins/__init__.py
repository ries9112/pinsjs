import argparse
import sys
import os
import logging
import js2py

import pins
import pins.host

_logger = logging.getLogger(__name__)

def _resolve(promise):
  global _resolved
  global _error
  _resolved = None
  _error = None

  def resolve(value):
    global _resolved
    if value is not None:
      _resolved = value.to_python()
      if hasattr(_resolved, "to_list") and len(_resolved) > 0:
        _resolved = _resolved.to_list()

  def catch(error):
    global _error
    _error = error.value

  if hasattr(promise, "then"):
    promise["then"](resolve)
  if hasattr(promise, "catch"):
    promise["catch"](catch)

  if not _error == None:
    raise RuntimeError(_error)

  return _resolved

def host_log(message):
  _logger.info(message)

def setup_logging(log_level):
  log_format = "[%(asctime)s] %(levelname)s:%(name)s %(message)s"
  logging.basicConfig(level=log_level, stream=sys.stdout,
                      format=log_format, datefmt="%Y-%m-%d %H:%M:%S")

def pins_load_js(file):
  global _pins_lib
  pins_path = os.path.join(__path__[0], "js", file)

  file = open(pins_path, "r")
  pins_source = file.read()
  file.close()

  _pins_lib = _context.eval(pins_source)

def pins_configure():
  global _context
  global _pins_lib

  setup_logging("INFO")
  _logger.debug("pins starting...")
  _context = js2py.EvalJs({ "host_log": host_log })

  pins_load_js("polyfills.js")
  pins_load_js("pins.js")

  host.init_callbacks()

def board_list():
  global _pins_lib
  return _pins_lib["boardList"]()

def board_register(board, **kwargs):
  global _pins_lib
  return _resolve(_pins_lib["boardRegister"](board, kwargs))

def board_deregister(board):
  global _pins_lib
  return _resolve(_pins_lib["boardDeregister"](board))

def callbacks_set(name, callback):
  global _pins_lib
  _pins_lib["callbacks"]["set"](name, callback)
  return True

def callbacks_get(name):
  global _pins_lib
  return _pins_lib["callbacks"]["get"](name)

def pin(x, **kwargs):
  global _pins_lib
  return _resolve(_pins_lib["pin"](x, kwargs))

def pin_get(x, **kwargs):
  global _pins_lib
  return _resolve(_pins_lib["pinGet"](x, kwargs))

def pin_find(x, **kwargs):
  global _pins_lib
  return _resolve(_pins_lib["pinFind"](x, kwargs))

def pin_info(x, **kwargs):
  global _pins_lib
  return _resolve(_pins_lib["pinInfo"](x, kwargs))

def pin_remove(x, board):
  global _pins_lib
  return _resolve(_pins_lib["pinRemove"](x, board))

def pin_versions(x, **kwargs):
  global _pins_lib
  return _resolve(_pins_lib["pinVersions"](x, kwargs))

pins_configure()
