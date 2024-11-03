import React, { useState, useEffect, useRef } from 'react';

export const initMap = () => {
    const { naver } = window;
  
    if (!naver) {
      console.error('Naver Maps API가 로드되지 않았습니다.');
      return;
    }
  
    const mapOptions = {
      center: new naver.maps.LatLng(37.5665, 126.9780),
      zoom: 10,
    };
  
    const map = new naver.maps.Map('map', mapOptions);
  
    naver.maps.Event.addListener(map, 'click', function (event) {
      const latlng = event.latLng;
  
      if (latlng) {
        new naver.maps.Marker({
          position: latlng,
          map: map,
        });
  
        const infoWindow = new naver.maps.InfoWindow({
          content: `<div style="padding:10px;">위도: ${latlng.lat()}, 경도: ${latlng.lng()}</div>`,
        });
  
        infoWindow.open(map, latlng);
      } else {
        console.error('클릭 이벤트에서 latLng 정보가 정의되지 않았습니다.');
      }
    });
  
    const gpsControl = document.createElement('div');
    gpsControl.style.backgroundColor = '#fff';
    gpsControl.style.border = '2px solid #ccc';
    gpsControl.style.borderRadius = '3px';
    gpsControl.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    gpsControl.style.cursor = 'pointer';
    gpsControl.style.margin = '10px';
    gpsControl.style.padding = '5px';
    gpsControl.title = '현재 위치로 이동';
    gpsControl.innerHTML = '📍';
  
    map.controls[naver.maps.Position.TOP_RIGHT].push(gpsControl);
  
    gpsControl.addEventListener('click', () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const currentLocation = new naver.maps.LatLng(position.coords.latitude, position.coords.longitude);
          map.setCenter(currentLocation);
          map.setZoom(10);
  
          new naver.maps.Marker({
            position: currentLocation,
            map: map,
          });
        }, (error) => {
          alert('위치 정보를 가져오는 데 실패했습니다.');
        });
      } else {
        alert('이 브라우저에서는 Geolocation이 지원되지 않습니다.');
      }
    });
  };
  
  export const loadNaverMapScript = () => {
    const MapKey = process.env.REACT_APP_MAP_KEY;
    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${MapKey}`;
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
  
    return () => {
      const script = document.querySelector(`script[src*="${process.env.REACT_APP_MAP_KEY}"]`);
      if (script) {
        script.remove();
      }
    };
  };  