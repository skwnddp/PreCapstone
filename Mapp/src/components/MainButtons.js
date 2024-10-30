import React from 'react';

function MainButtons() {
  return (
    <div className="main-buttons">
      <div className="button">
        <i className="fa fa-utensils"></i>  {/* 아이콘 */}
        <p>메뉴 추천</p>
      </div>
      <div className="button">
        <i className="fa fa-heart"></i>  {/* 아이콘 */}
        <p>즐겨찾기</p>
      </div>
      <div className="button">
        <i className="fa fa-pencil-alt"></i>  {/* 아이콘 */}
        <p>리뷰 작성</p>
      </div>
    </div>
  );
}

export default MainButtons;
