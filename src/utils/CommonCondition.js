export default {
  where(params) {
    let condition = '?'
    let y = 1
    Object.keys(params).forEach((item) => {
      if (y == 1) {
        condition += `${item}=${params[item]}`
      } else {
        condition += `&${item}=${params[item]}`
      }
      y++
      return true
    })
    return condition
  },
}
