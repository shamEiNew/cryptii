
import Chain from '../Chain'
import Setting from '../Setting'
import TextEncoder from '../TextEncoder'
import TextSettingView from '../View/Setting/Text'

/**
 * Text Setting.
 */
export default class TextSetting extends Setting {
  /**
   * Setting constructor.
   * @param {string} name
   * @param {Object} [spec]
   * @param {mixed} [spec.options] Setting options
   * @param {?number} [spec.options.minLength=null] Minimum amount of characters
   * @param {?number} [spec.options.maxLength=null] Maximum amount of characters
   * @param {?number[]} [spec.options.allowedCodePoints=null]
   * Restricts text to given Unicode code points.
   * @param {boolean} [spec.options.caseSensitivity=false]
   * Wether to respect case sensitivity.
   */
  constructor (name, spec = {}) {
    super(name, spec)
    this._viewPrototype = TextSettingView

    this._value = Chain.wrap(spec.value || null)

    this._minLength = null
    this._maxLength = null
    this._allowedChars = null
    this._caseSensitivity = null

    const options = spec.options || {}
    this.setMinLength(options.minLength || null, false)
    this.setMaxLength(options.maxLength || null, false)
    this.setAllowedChars(options.allowedChars || null, false)
    this.setCaseSensitivity(options.caseSensitivity || false, false)
  }

  /**
   * Returns min text length.
   * @return {number}
   */
  getMinLength () {
    return this._minLength
  }

  /**
   * Sets min text length.
   * @param {?number} minLength Min text length
   * @param {boolean} [revalidate=true] Wether to revalidate current value.
   * @return {TextSetting} Fluent interface
   */
  setMinLength (minLength, revalidate = true) {
    if (this._minLength === minLength) {
      return this
    }
    this._minLength = minLength !== null ? parseInt(minLength) : null
    return revalidate ? this.revalidateValue() : this
  }

  /**
   * Returns max text length.
   * @return {?number}
   */
  getMaxLength () {
    return this._maxLength
  }

  /**
   * Sets max text length.
   * @param {?number} maxLength Max text length
   * @param {boolean} [revalidate=true] Wether to revalidate current value.
   * @return {TextSetting} Fluent interface
   */
  setMaxLength (maxLength, revalidate = true) {
    if (this._maxLength === maxLength) {
      return this
    }
    this._maxLength = maxLength !== null ? parseInt(maxLength) : null
    return revalidate ? this.revalidateValue() : this
  }

  /**
   * Returns allowed Unicode code points.
   * @return {?number[]} Allowed Unicode code points
   */
  getAllowedChars () {
    return this._allowedChars
  }

  /**
   * Restricts text to given Unicode code points.
   * @param {?number[]|string|Chain} allowedChars
   * @param {boolean} [revalidate=true] Wether to revalidate current value.
   * @return {TextSetting} Fluent interface
   */
  setAllowedChars (allowedChars, revalidate = true) {
    if (this._allowedChars === allowedChars) {
      return this
    }

    if (typeof allowedChars === 'string') {
      allowedChars = TextEncoder.codePointsFromString(allowedChars)
    } else if (allowedChars instanceof Chain) {
      allowedChars = allowedChars.getCodePoints()
    }

    this._allowedChars = allowedChars
    return revalidate ? this.revalidateValue() : this
  }

  /**
   * Returns wether to respect case sensitivity.
   * @return {boolean}
   */
  isCaseSensitive () {
    return this._caseSensitivity
  }

  /**
   * Sets wether to respect case sensitivity.
   * @param {boolean} caseSensitivity
   * @param {boolean} [revalidate=true] Wether to revalidate current value.
   * @return {TextSetting} Fluent interface
   */
  setCaseSensitivity (caseSensitivity, revalidate = true) {
    if (this._caseSensitivity === caseSensitivity) {
      return this
    }
    this._caseSensitivity = caseSensitivity
    return revalidate ? this.revalidateValue() : this
  }

  /**
   * Validates given raw value.
   * @param {mixed} rawValue Value to be validated.
   * @return {boolean} True, if valid.
   */
  validateValue (rawValue) {
    if (typeof rawValue.toString !== 'function') {
      return false
    }

    let value = this.filterValue(rawValue)

    // validate min text length
    if (this._minLength !== null && value.getLength() < this._minLength) {
      return false
    }

    // validate max text length
    if (this._maxLength !== null && value.getLength() > this._maxLength) {
      return false
    }

    // validate allowed chars
    let valid = true
    if (this._allowedChars !== null) {
      let i = -1
      while (valid && ++i < value.getLength()) {
        valid = this._allowedChars.indexOf(value.getCodePointAt(i)) !== -1
      }
    }

    if (!valid) {
      return false
    }

    return super.validateValue(rawValue)
  }

  /**
   * Filters given raw value.
   * @param {mixed} rawValue Value to be filtered.
   * @return {mixed} Filtered value
   */
  filterValue (rawValue) {
    rawValue = Chain.wrap(rawValue)
    if (this._caseSensitivity === false) {
      rawValue = rawValue.toLowerCase()
    }
    return super.filterValue(rawValue)
  }

  /**
   * Triggered when value has been changed inside the view.
   * @protected
   * @param {TextSettingView} view
   * @param {mixed} value
   * @return {TextSetting} Fluent interface
   */
  viewValueDidChange (view, value) {
    return this.setValue(value, view)
  }
}
