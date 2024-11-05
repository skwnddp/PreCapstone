import React, { useState, useEffect, useRef } from 'react';

// MapKey 주소 안에 넣을 때 따옴표 ㄴㄴ 백틱(물결키)
// 지도 클릭 이벤트 등록
// 런타임 에러 원인 : 네이버 지도 map 객체 없는데 호출해서
export const MapComponent = () => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]); // 마커 상태 추가
  const [polylines, setPolylines] = useState([]); // 폴리라인 상태 추가

  useEffect(() => {
    const loadNaverMapScript = () => {
      const MapKey = process.env.REACT_APP_MAP_KEY;
      const script = document.createElement('script');
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${MapKey}`;
      script.async = true;
      script.onload = () => {
        const initializedMap = initMap(); // 초기화된 지도 객체 반환
        setMap(initializedMap); // map 상태로 설정
      };
      document.head.appendChild(script);

      return () => {
        const script = document.querySelector(`script[src*="${MapKey}"]`);
        if (script) {
          script.remove();
        }
      };
    };

    loadNaverMapScript();
  }, []);

  const initMap = () => {
    if (!window.naver) {
      console.error('Naver Maps API가 로드되지 않았습니다.');
      return null;
    }

    const mapOptions = {
      center: new window.naver.maps.LatLng(37.5665, 126.9780),
      zoom: 14,
      zoomControl: true, //줌 컨트롤의 표시 여부
      zoomControlOptions: { //줌 컨트롤의 옵션
          position: window.naver.maps.Position.TOP_RIGHT
      }
    };

    const createdMap = new window.naver.maps.Map('map', mapOptions);

    window.naver.maps.Event.addListener(createdMap, 'click', (event) => {
      const latlng = event.latLng;
      if (latlng) {
        new window.naver.maps.Marker({
          position: latlng,
          map: createdMap,
        });

        const infoWindow = new window.naver.maps.InfoWindow({
          content: `<div style="padding:10px;">위도: ${latlng.lat()}, 경도: ${latlng.lng()}</div>`,
        });
        infoWindow.open(createdMap, latlng);
      } else {
        console.error('클릭 이벤트에서 latLng 정보가 정의되지 않았습니다.');
      }
    });

    return createdMap;
  };

  const addMarker = () => {
    if (!map) return;
    // 한성대 마커 위치
    const markerPosition = new window.naver.maps.LatLng(37.5825, 127.0103);
    const marker = new window.naver.maps.Marker({
      position: markerPosition,
      map: map,
    });

    setMarkers((prevMarkers) => [...prevMarkers, marker]);
  };

  const removeMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  };

  const addPolyline = () => {
    if (!map) return;

    // 폴리라인의 경로를 설정
    const path = [
      new window.naver.maps.LatLng(37.5825, 127.0103), // 한성대학교
      new window.naver.maps.LatLng(37.5850, 127.0150), // 임의의 다른 위치
      new window.naver.maps.LatLng(37.5900, 127.0200)  // 또 다른 위치
    ];

    const polyline = new window.naver.maps.Polyline({
      path: path,
      strokeColor: '#FF0000', // 폴리라인 색상
      strokeWeight: 5,         // 폴리라인 두께
      map: map,
    });

    // 폴리라인을 상태에 저장
    setPolylines((prevPolylines) => [...prevPolylines, polyline]);
  };

  const removePolylines = () => {
    polylines.forEach(polyline => {
      polyline.setMap(null); // 폴리라인 삭제
    });
    setPolylines([]); // 상태 초기화
  };


  const handleGpsClick = (map) => {
    if (!map || !(map instanceof window.naver.maps.Map)) {
      console.error("지도 객체가 초기화되지 않았거나 올바르지 않습니다.");
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const moveLatLon = new window.naver.maps.LatLng(latitude, longitude);
        map.setCenter(moveLatLon); // 현재 위치로 지도의 중심 이동
      }, (error) => {
        console.error("Geolocation error:", error);
      });
    } else {
      alert("GPS를 지원하지 않는 브라우저입니다.");
    }
  };

  return (
    <div>
      <div id="map" style={{ width: '80%', height: '500px' }}></div>
      <br />
      <button onClick={() => handleGpsClick(map)}>현재 위치 📍</button> <span/><span/>
      <button onClick={addMarker}>한성대 마커 추가</button> 
      <button onClick={removeMarkers}>한성대 마커 삭제</button> <span/><span/>
      <button onClick={addPolyline}>폴리라인 추가</button> 
      <button onClick={removePolylines}>폴리라인 삭제</button>
    </div>
  );
};