# Changelog
All notable changes to this project will be documented in this file.

## [1.4.3] - 2023-05-11

### Fixed
- Support for touch on large devices

## [1.4.1] - 2019-07-23

### Added
- Support for touch on large devices

## [1.4.0] - 2019-05-08

### Added
- Support nested navigation in compact mode beyond 2nd level 

## [1.3.0] - 2019-04-30

### Fixed
- compact mode keyDown handler error caused by `button` dropdown toggle in version `1.2.10'
- removed console.log debug messages

### Added
- `data-bm-compact-show-current` support added as data attribute (default: false), in compact mode the active submenu is now no longer the active menu

## [1.2.14] - 2019-04-30

### Fixed
- error when no compact canvas selector set

## [1.2.12] - 2019-04-12

### Fixed
- blurry text on chrome

## [1.2.11] - 2019-04-12

### Fixed
- css perspective property removed from bm-menu 
- css adjustments 1.2.10 related added

## [1.2.10] - 2019-04-12

### Fixed
- accessibility support fixed, dropdownRoots are now buttons (toggle dropdown on focus with enter/space and tab through dropdown if toggled)
- css perspective property removed from bm-menu 

## [1.2.9] - 2019-02-05

### Fixed
- allow vertical scroll in compact mode

## [1.2.8] - 2019-01-29

### Fixed
- set aria-expanded to false on closeDropDown

## [1.2.7] - 2019-01-25

### Fixed
- js error fixed, when no dropdown is available 

## [1.2.6] - 2019-01-23

### Fixed
- fix `aria-expanded` (true, false) on canvas toggle elements (open/close)

## [1.2.5] - 2019-01-23

### Fixed
- set visibility to hidden for relevant elements until buttermenu is initialized (`bm-initialized`) to prevent flickering on page load

## [1.2.4] - 2019-01-22

### Fixed
- disable pointer-events on current active dropdown if not visible properly

## [1.2.3] - 2019-01-22

### Fixed
- on close dropdown/canvas unset keyboard navigation 

## [1.2.2] - 2019-01-22

### Fixed
- keyboard navigation event handling (make usage of enhancedElements array in order to add and remove event listeners on demand)

## [1.2.1] - 2019-01-21

### Fixed
- position fix within keyboard navigation (dropdown mode)

## [1.2.0] - 2019-01-21

### Added
- keyboard navigation in compact mode

### Fixed
- overlapping invisible links in Edge browser

## [1.1.10] - 2019-01-17

### Fixed
- dropdown section alignment for few menu items

## [1.1.9] - 2019-01-16

### Fixed
- Microsoft EDGE support (fix overlapping menu links of non visible menus)
- visibility/transition tweaks

## [1.1.8] - 2019-01-16

### Fixed
- ARIA support in default mode

## [1.1.7] - 2018-12-17

### Fixed
- IE 11 support

## [1.1.6] - 2018-12-17

### Fixed
- IE 11 support

## [1.1.5] - 2018-12-17

### Fixed
- Edge support

## [1.1.4] - 2018-12-11

### Fixed
- trigger registerEvents only again if window width changed 

## [1.1.3] - 2018-12-11

### Fixed
- properly close dropdown on leaving root nav in normal mode
- do not reset style attribute on closing dropdown in normal mode
- smoother closing-animation: apply background always to arrow and background in normal mode

## [1.1.2] - 2018-11-28

### Fixed
- removed `overflow: hidden` from `.bm-dropdown-container` (dropdown-menus might otherwise be wrong positioned while tab navigation)

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
