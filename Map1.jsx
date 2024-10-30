import React, { useEffect } from 'react';
import { NaverMap, Marker } from 'react-naver-maps';

const NaverMapComponent = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=공백`;
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script); // 컴포넌트 언마운트 시 스크립트 제거
    };
  }, []);

  const navermaps = window.naver?.maps; // 네이버 맵이 로드되기 전까지 undefined 방지

  return (
    <>
      {navermaps ? (
        <NaverMap
          mapDivId={'react-naver-map'} // 지도 div의 id
          style={{
            width: '100%',
            height: '400px',
          }}
          defaultCenter={{ lat: 37.5665, lng: 126.9780 }}
          defaultZoom={10}
        >
          <Marker
            key={1}
            position={new navermaps.LatLng(37.5665, 126.9780)}
            animation={navermaps.Animation.BOUNCE}
          />
        </NaverMap>
      ) : (
        <div>지도를 불러오는 중...</div>
      )}
    </>
  );
};

export default NaverMapComponent;