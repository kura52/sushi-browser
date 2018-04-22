
const getProps = (styles, prop)=>{
  let props = {top: 0, right: 0, bottom: 0, left: 0}

  Object.keys(props).forEach(side => {
    let _side = prop + side[0].toUpperCase() + side.substr(1)
    let _prop = parseFloat(styles[_side])
    if (!isNaN(_prop)) {
      props[side] = _prop
    }
  })

  return props
}

const calcQuad = (x,y,width,height) => [x,y,x+width,y,x+width,y+height,x,y+height]

const getBoxQuads = (node)=>{
  if (node === document) node = document.documentElement
  const rect = node.getBoundingClientRect();
  const styles = window.getComputedStyle(node);
  const margins = getProps(styles, 'margin');
  const borders = getProps(styles, 'border');
  const paddings = getProps(styles, 'padding');
  let offsetX = 0,offsetY = 0

  const result = {}
  for(let box of ['content','padding','border','margin']){
    let x = rect.left - offsetX;
    let y = rect.top - offsetY;
    let width = rect.width;
    let height = rect.height;

    if (box === 'margin') {
      x -= margins.left;
      y -= margins.top;

      width += margins.left + margins.right;
      height += margins.top + margins.bottom;
    }

    if (box === 'padding') {
      x += borders.left;
      y += borders.top;

      width -= borders.left + borders.right;
      height -= borders.top + borders.bottom;
    }

    if (box === 'content') {
      x += borders.left + paddings.left;
      y += borders.top + paddings.top;

      width -= borders.left + borders.right + paddings.left + paddings.right;
      height -= borders.top + borders.bottom + paddings.top + paddings.bottom;
    }

    result[box] = calcQuad(x, y, width, height)
  }
  return result
}
