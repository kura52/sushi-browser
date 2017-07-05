
/**
 *
 * @param rectangle
 * @param container
 * @param direction top-left, top-right, down-right, down-left
 */
class LimitRange {
  constructor(direction = '') {
    this.direction = direction
  }

  freezeWidth = false
  freezeHeight = false

  getNewSize({rectangle, container}) {
    const {left, top, width, height} = rectangle
    const {offsetWidth, offsetHeight} = container
    const size = {...rectangle}

    const maxWidth = offsetWidth - left
    const maxHeight = offsetHeight - top

    switch (this.direction) {
      case 'top-left':
        if (left <= 0) {
          if (!this.freezeWidth) this.freezeWidth = width + left
          size.left = 0
          size.width = this.freezeWidth
        }

        if (top <= 0) {
          if (!this.freezeHeight) this.freezeHeight = height + top
          size.top = 0
          size.height = this.freezeHeight
        }
        break

      case 'top-right':
        if (maxWidth - width <= 0){
          if (!this.freezeWidth) this.freezeWidth = maxWidth
          size.width = this.freezeWidth
        }

        if (top <= 0){
          size.top = 0
          if (!this.freezeHeight) this.freezeHeight = height
          size.height = this.freezeHeight
        }
        break

      case 'down-right':
        if (maxWidth - width <= 0){
          if (!this.freezeWidth) this.freezeWidth = maxWidth
          size.width = this.freezeWidth
        }

        if (maxHeight - height <= 0){
          if (!this.freezeHeight) this.freezeHeight = maxHeight
          size.height = this.freezeHeight
        }
        break

      case 'down-left':
        if (maxHeight - height <= 0){
          if (!this.freezeHeight) this.freezeHeight = maxHeight
          size.height = this.freezeHeight
        }
        if (left <= 0){
          if (!this.freezeWidth) this.freezeWidth = width + left
          size.left = 0
          size.width = this.freezeWidth
        }

        break
    }
    return size
  }

  reset() {
    this.freezeWidth = false
    this.freezeHeight = false

    return this
  }
}

module.exports = LimitRange
