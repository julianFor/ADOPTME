import React from 'react'

const Paginacion = () => (
  <div className="pagination">
    <button className="prev">&lt;</button>
    {[...Array(8).keys()].map(i => (
      <button key={i} className={i === 0 ? 'active' : ''}>{i + 1}</button>
    ))}
    <button className="next">&gt;</button>
  </div>
)

export default Paginacion
