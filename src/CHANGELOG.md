# Changelog

## [1.1.0][1.1.0] - 2025-02-06

### Added

- Implement `setElementAttribute` and document it
- Add a `.withOpenShadow` `CssSanitizerBuilder` option
- Add "controlslist" to the list of globally permitted attributes
- Add a CHANGELOG.md that follows https://common-changelog.org/

### Changed

- Downgrade the global attribute contracts for "cite" and "poster" attributes in the sanitizer
- Extend `allowDataAttributes` from the `HtmlSanitizerBuilder` to allow any `data-*` attributes

## [1.0.1][1.0.1] - 2025-01-03

_Initial release._

[1.1.0]: https://github.com/google/safevalues/releases/tag/v1.1.0
[1.0.1]: https://github.com/google/safevalues/releases/tag/v1.0.1