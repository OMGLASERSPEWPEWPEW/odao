# OnionDAO Badge — Onion OS (ESP-IDF + arduino-esp32)
# ESP32-S3-WROOM-1-N8R8 (8 MB flash, 8 MB OPI PSRAM)
cmake_minimum_required(VERSION 3.16)

set(EXTRA_COMPONENT_DIRS "${CMAKE_CURRENT_LIST_DIR}/../../components")

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(onion-os)

file(GLOB _lua_scripts "${CMAKE_CURRENT_LIST_DIR}/scripts/*.lua")
foreach(_script ${_lua_scripts})
    get_filename_component(_name ${_script} NAME)
    configure_file(${_script} "${CMAKE_CURRENT_LIST_DIR}/data/scripts_${_name}" COPYONLY)
endforeach()

# Builds build/spiffs.bin from data/ but does NOT auto-flash it.
# Use --with-data in build-flash.sh or idf.py spiffs-flash to write SPIFFS.
spiffs_create_partition_image(spiffs "${CMAKE_CURRENT_LIST_DIR}/data")
