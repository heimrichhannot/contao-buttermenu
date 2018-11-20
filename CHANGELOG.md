# Changelog
All notable changes to this project will be documented in this file.

## [1.1.1] - 2018-11-20

### Fixed
- `data-bm-column-min` behavior and fixed wrong height on resize

## [1.1.0] - 2018-11-19

### Added
- flex column wrap support with data attributes `data-bm-column-min`, `data-bm-columns`

## [1.0.7] - 2018-10-30

### Fixed
- `registerArrowKeyNavigation` refactored

## [1.0.6] - 2018-10-30

### Fixed
- hide `.bm-prev-wrapper` in normal menu mode

## [1.0.5] - 2018-10-29

### Fixed
- default menu: change active dropdown section class to `bm-active`, reset aria-expanded after dropdown changes   

## [1.0.4] - 2018-10-29

### Fixed
- `z-index` variables added and increase to fit between bootstrap dropdown and sticky z-index

## [1.0.3] - 2018-10-24

### Fixed
- do not block content below `.bm-dropdown-wrapper` by adding `pointer-events: none` and changed z-index from 500 to 1060 and added variable to adjust

## [1.0.2] - 2018-10-24

### Fixed
- remove styles from arrow and background on closeDropdown

## [1.0.1] - 2018-10-24

### Added
- Dropped `scss` include in js file and added `!default` to all butter menu scss variables

## [1.0.0] - 2018-10-24

### Added
- initial version
