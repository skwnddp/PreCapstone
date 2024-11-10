import React, { useState, useEffect, useRef } from 'react';

// MapKey 주소 안에 넣을 때 따옴표 ㄴㄴ 백틱(물결키)
// 지도 클릭 이벤트 등록
// 런타임 에러 원인 : 네이버 지도 map 객체 없는데 호출해서

export const MapComponent = () => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]); // 마커 상태 추가
  const [polylines, setPolylines] = useState([]); // 폴리라인 상태 추가
  const [location, setLocation] = useState(''); // 텍스트박스 값
  const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태

  // Naver 지도 API 로드 및 지도 초기화
  useEffect(() => {
    const loadNaverMapScript = () => {
      const MapKey = process.env.REACT_APP_MAP_KEY;
      const script = document.createElement('script');
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${MapKey}`;
      script.async = true;
      script.onload = () => {        
        const initializedMap = initMap(); // 초기화된 지도 객체 반환
        setMap(initializedMap); // map 상태로 설정
        handleTextareaInput();
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
  }, []); // 의존성 배열이 빈 배열이므로, 처음 한 번만 실행

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

    //쿼리 검색
    if (searchQuery) {
      searchLocation(searchQuery, map);
    }

    // 위치 검색 함수
    const searchLocation = (query, map) => {
      const geocoder = new window.naver.maps.Geocoder();

      // 주소로 위치 찾기
      geocoder.geocode({ address: query }, (status, response) => {
        if (status === window.naver.maps.Service.Status.OK) {
          const result = response.v2.result.items[0];
          const latlng = new window.naver.maps.LatLng(result.point.y, result.point.x);

          // 지도 중심 변경
          map.setCenter(latlng);

          // 마커 추가
          new window.naver.maps.Marker({
            position: latlng,
            map: map,
          });
        } else {
          alert('검색된 결과가 없습니다.');
        }
      });
    };

    // 지도 생성, 컴포넌트 언마운트 시 지도 이벤트 리스너 제거
    return createdMap;
  }

  // textarea의 값 변경 감지하고 addMarker 호출
  const handleTextareaInput = () => {
    const textarea = document.getElementById('hiddenLatLng');

    //if (textarea) {
    const inputText = textarea.value;

    // 줄바꿈을 기준으로 위도와 경도를 분리
    const coordinates = inputText.split('\n');
    console.log(coordinates)

    // 각 줄마다 위도, 경도 처리
    coordinates.forEach((line) => {
      const [latitude, longitude] = line.split(', ').map(val => parseFloat(val.trim()));

      // addMarker 호출
      addMarker(latitude, longitude);
      console.log("each 호출여부")
    });
    //}
  };

  //왜 latitude만 이상한 시네마틱 값으로 전달해서 Nan 처리 되는건지 이해 불가능
  const addMarker = (latitude, longitude) => {

    // 값이 올바르지 않으면 기본값 설정
    latitude = isNaN(latitude) ? 37.5825 : latitude;
    longitude = isNaN(longitude) ? 127.0103 : longitude;

    //if (!map) return;

    const markerPosition = new window.naver.maps.LatLng(latitude, longitude);
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
      strokeWeight: 10,         // 폴리라인 두께
      strokeOpacity: 0.5,
      map: map,
    });

    // 시작 색상과 끝 색상 (RGB로 부드럽게 변화)
    let startColor = { r: 188, g: 188, b: 188 };  // 흰색
    let endColor = { r: 0, g: 0, b: 0 };         // 검정색
    let currentTime = 0;  // 애니메이션 시간

    // 그라데이션 애니메이션 (부드럽게 색상 변화)
    const animateGradient = () => {
      currentTime += 0.01;  // 시간 증가

      // 색상 계산 (시간에 따라 두 색상 간 부드럽게 보간)
      const r = Math.floor(startColor.r + (endColor.r - startColor.r) * currentTime);
      const g = Math.floor(startColor.g + (endColor.g - startColor.g) * currentTime);
      const b = Math.floor(startColor.b + (endColor.b - startColor.b) * currentTime);

      // 색상 업데이트
      const newColor = `rgb(${r}, ${g}, ${b})`;
      polyline.setOptions({
        strokeColor: newColor,
      });

      // 애니메이션이 끝나면 색상 전환을 초기화
      if (currentTime < 1) {
        requestAnimationFrame(animateGradient);  // 부드럽게 다음 프레임으로
      } else {
        // 색상 전환이 끝나면 새로 시작하도록 리셋
        currentTime = 0;
        [startColor, endColor] = [endColor, startColor];  // 색상 변경
        requestAnimationFrame(animateGradient);
      }
    };

    // 애니메이션 시작
    animateGradient();

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

  //지도 내 latlng 기반 좌표로 이동
  const handleLocationChange = () => {
    // 숫자와 쉼표만 남기고 필터링
    const filteredLocation = location.replace(/[^0-9.,-]/g, '');
    const [lat, lng] = filteredLocation.split(',').map(Number);

    if (!isNaN(lat) && !isNaN(lng) && map) {
      const newCenter = new window.naver.maps.LatLng(lat, lng);
      map.setCenter(newCenter);
    }
  };

  //검색 시 좌표 이동
  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      // 검색어가 비어있지 않으면 searchQuery 업데이트
      setSearchQuery(searchQuery);
    }
  };

  return (
    <div>
      <div id="map" style={{ width: '100%', height: '500px' }}></div>
      <br />
      <div style={{
        position: 'absolute',
        top: '300px', // 지도에서 리스트의 상단 위치 조정
        left: '40%', // 지도에서 리스트의 좌측 위치 조정
        width: '200px',
        height: '200px',
        border: '2px solid black',
        borderRadius: "10%",
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // 배경 색상 투명하게 설정 (선택사항)
        color: 'black', // 글자는 불투명하게 설정
        zIndex: 1 // 리스트가 지도 위로 오도록 설정
      }}>
        <div>리스트 1</div>
        <div>리스트 2</div>
        <div>리스트 3</div>
        <div>리스트 4</div>
        <div>리스트 5</div>
      </div>
      <button onClick={() => handleGpsClick(map)}>현재 위치 📍</button> <span /><span />
      <button onClick={addMarker}>한성대 마커 추가</button>
      <button onClick={removeMarkers}>한성대 마커 삭제</button> <span /><span />
      <button onClick={addPolyline}>폴리라인 추가</button>
      <button onClick={removePolylines}>폴리라인 삭제</button>
      <input
        type="text"
        placeholder="위도,경도 입력"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <button onClick={handleLocationChange}>위치 이동</button>
      <div>
        <h1>맛집 검색</h1>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // 입력값 상태 업데이트
          placeholder="맛집 이름 또는 주소 입력"
        />
        <button onClick={handleSearch}>검색</button>
        <textarea id='hiddenLatLng'></textarea>
      </div>
    </div>
  );
};

export default Map