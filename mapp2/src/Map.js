import React, { useState, useEffect, useMemo, forwardRef } from 'react';

// MapKey 주소 안에 넣을 때 따옴표 ㄴㄴ 백틱(물결키)
// 지도 클릭 이벤트 등록
// 런타임 에러 원인 : 네이버 지도 map 객체 없는데 호출해서

// 지도 관리 클래스
class MapManager {
    constructor(mapKey, setMap) {
        this.mapKey = mapKey;
        this.setMap = setMap;
    }

    loadMapScript(callback) {
        const script = document.createElement('script');
        script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${this.mapKey}`;
        script.async = true;
        script.onload = callback;
        document.head.appendChild(script);

        return () => {
            const script = document.querySelector(`script[src*="${this.mapKey}"]`);
            if (script) script.remove();
        };
    }

    initMap() {
        if (!window.naver) return null;
        const map = new window.naver.maps.Map('map', {
            center: new window.naver.maps.LatLng(37.5665, 126.9780),
            zoom: 14,
            zoomControl: true,
            zoomControlOptions: {
                position: window.naver.maps.Position.TOP_RIGHT,
            },
        });
        this.setMap(map);

        // 버튼 생성
        const button = document.createElement('button');
        button.innerHTML = '현재 위치로 이동';
        button.style.position = 'absolute';
        button.style.top = '10px';
        button.style.left = '10px';
        button.style.zIndex = '1000';
        button.style.padding = '10px';
        button.style.backgroundColor = '#008CBA';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '10px';
        button.style.cursor = 'pointer';

        // 버튼을 지도 컨테이너에 추가
        const mapContainer = document.getElementById('map');
        mapContainer.appendChild(button);

        // 버튼 클릭 시 GpsManager 메서드 호출
        button.addEventListener('click', () => {
            new GpsManager(map).handleGpsClick();
        });

        return map;
    }
}

// GPS 관리 클래스
class GpsManager {
    constructor(map) {
        this.map = map;
    }

    // 현재 위치 탐색 메서드
    handleGpsClick() {
        if (!this.map || !(this.map instanceof window.naver.maps.Map)) {
            console.error("지도 객체가 초기화되지 않았거나 올바르지 않습니다.");
            return;
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const moveLatLon = new window.naver.maps.LatLng(latitude, longitude);
                    this.map.setCenter(moveLatLon); // 현재 위치로 지도의 중심 이동
                    console.log("현재 위치로 이동 : ", latitude, ",", longitude);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                }
            );
        } else {
            alert("GPS를 지원하지 않는 브라우저입니다.");
        }
    }
}

// 폴리라인 관리 클래스
class PolylineManager {
    constructor(map) {
        this.map = map;
        this.polylines = []; // 폴리라인 상태를 클래스 속성으로 관리
    }

    addCustomPolyline = () => {
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
            map: this.map,
        });

        // 그라데이션 애니메이션 (부드럽게 색상 변화)
        let startColor = { r: 188, g: 188, b: 188 };  // 흰색
        let endColor = { r: 0, g: 0, b: 0 };         // 검정색
        let currentTime = 0;  // 애니메이션 시간

        const animateGradient = () => {
            currentTime += 0.01;

            const r = Math.floor(startColor.r + (endColor.r - startColor.r) * currentTime);
            const g = Math.floor(startColor.g + (endColor.g - startColor.g) * currentTime);
            const b = Math.floor(startColor.b + (endColor.b - startColor.b) * currentTime);

            const newColor = `rgb(${r}, ${g}, ${b})`;
            polyline.setOptions({
                strokeColor: newColor,
            });

            if (currentTime < 1) {
                requestAnimationFrame(animateGradient);
            } else {
                currentTime = 0;
                [startColor, endColor] = [endColor, startColor];
                requestAnimationFrame(animateGradient);
            }
        };

        animateGradient();

        // 폴리라인을 클래스 속성에 저장
        this.polylines.push(polyline);
    };

    addPolyline = (coordinates) => {
        if (!this.map || !window.naver) return;

        // 폴리라인의 경로를 설정 (좌표 배열을 기준으로)
        const path = coordinates.map(([lat, lng]) => new window.naver.maps.LatLng(lat, lng));

        // 새로운 폴리라인을 그리기
        const polyline = new window.naver.maps.Polyline({
            path: path, // 전달된 경로 좌표
            strokeColor: 'rgb(188, 188, 188)',  // 초기 색상 (흰색)
            strokeWeight: 20,                   // 폴리라인 두께
            strokeOpacity: 0.5,
            map: this.map,
        });

        // 그라데이션 애니메이션
        let startColor = { r: 188, g: 188, b: 188 };  // 초기 색상 (흰색)
        let endColor = { r: 0, g: 0, b: 0 };         // 끝 색상 (검정색)
        let currentTime = 0;  // 애니메이션 시간

        // 그라데이션 애니메이션 함수
        const animateGradient = () => {
            currentTime += 0.02;  // 시간 증가

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

        // 폴리라인을 배열에 저장
        this.polylines.push(polyline);
    }

    removePolyline = () => {
        // 모든 폴리라인을 지도에서 삭제
        this.polylines.forEach(polyline => {
            polyline.setMap(null);
        });
        this.polylines = []; // 배열 초기화
    };

    removePolyline = () => {
        // 저장된 모든 폴리라인을 삭제
        this.polylines.forEach(polyline => {
            polyline.setMap(null);
        });
        this.polylines = []; // 폴리라인 목록 초기화
    };
}

// 왜 latitude 위도만 이상한 시네마틱 값으로 전달해서 Nan 처리 되는건지 이해 불가능
// 마커 생성, 삭제
class MarkerManager {
    constructor(map) {
        this.map = map;
        this.markers = [];
    }

    addMarker(lat, lng) {
        if (!this.map || !window.naver) return;
        const position = new window.naver.maps.LatLng(lat, lng);
        const marker = new window.naver.maps.Marker({
            position,
            map: this.map,
        });
        this.markers.push(marker);
    }

    removeMarkers() {
        this.markers.forEach((marker) => marker.setMap(null));
        this.markers = [];
    }
}

// textarea의 값 변경 감지하고 addMarker 호출
// class ChangeTextarea {
//     constructor(map) {
//         this.map = map;
//         this.markers = [];
//     }
//     handleTextareaInput = () => {
//         const textarea = document.getElementById('hiddenLatLng');

//         //if (textarea) {
//         const inputText = textarea.value;

//         // 줄바꿈을 기준으로 위도와 경도를 분리
//         const coordinates = inputText.split('\n');
//         console.log(coordinates)

//         // 각 줄마다 위도, 경도 처리
//         coordinates.forEach((line) => {
//             const [latitude, longitude] = line.split(', ').map(val => parseFloat(val.trim()));

//             // addMarker 호출
//             MarkerManager.addMarker(latitude, longitude);
//             console.log("each 호출여부")
//         });
//         //}
//     };
// }

//지도 내 latlng 기반 좌표로 이동
class MoveLocation {
    constructor(map) {
        this.map = map;
        this.location = ''; // 위치 상태를 클래스 속성으로 관리
    }

    handleLocationChange = (location) => {
        // 숫자와 쉼표만 남기고 필터링
        const filteredLocation = location.replace(/[^0-9.,-]/g, '');
        const [lat, lng] = filteredLocation.split(',').map(Number);

        if (!isNaN(lat) && !isNaN(lng) && this.map) {
            const newCenter = new window.naver.maps.LatLng(lat, lng);
            this.map.setCenter(newCenter);  // 지도 중심 이동
        }
    };

    // 위치를 업데이트하는 메서드
    updateLocation = (newLocation) => {
        this.location = newLocation; // 클래스 속성에 위치 저장
    };
}

class CoordinateSorter {

    // 두 점 사이의 거리 계산 메서드
    static calculateDistance(point1, point2) {
        const [lat1, lng1] = point1;
        const [lat2, lng2] = point2;
        return Math.sqrt((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2);
    }

    // 최단 거리 경로를 찾는 메서드 (탐욕적 알고리즘)
    static findShortestPath(points) {
        const n = points.length;
        const visited = new Array(n).fill(false);
        const path = [0]; // 첫 번째 점을 시작점으로 선택
        visited[0] = true;

        for (let i = 1; i < n; i++) {
            const lastPointIndex = path[path.length - 1];
            let nearestIndex = -1;
            let minDistance = Infinity;

            // 방문하지 않은 점 중 가장 가까운 점 찾기
            for (let j = 0; j < n; j++) {
                if (!visited[j]) {
                    const dist = CoordinateSorter.calculateDistance(points[lastPointIndex], points[j]);
                    if (dist < minDistance) {
                        minDistance = dist;
                        nearestIndex = j;
                    }
                }
            }

            // 가장 가까운 점을 경로에 추가
            if (nearestIndex !== -1) {
                path.push(nearestIndex);
                visited[nearestIndex] = true;
            }
        }

        // 정렬된 좌표 배열 반환
        return path.map((index) => points[index]);
    }
}

// 지도 컴포넌트
export const MapComponent = ({ locations }) => {
    const [map, setMap] = useState(null);
    const [location, setLocation] = useState('');  // 위치 상태
    const [searchQuery, setSearchQuery] = useState('');
    const [textareaInput, setTextareaInput] = useState('');
    const [coordinates, setCoordinates] = useState([]);
    const [sortedCoordinates, setSortedCoordinates] = useState([]);
    const [trigger, setTrigger] = useState(false); // 버튼 클릭 트리거 상태

    useEffect(() => {
        const mapManager = new MapManager(process.env.REACT_APP_MAP_KEY, setMap);
        const removeScript = mapManager.loadMapScript(() => {
            const initializedMap = mapManager.initMap();
            setMap(initializedMap);
        });
        return () => removeScript();
    }, []);

    useEffect(() => {
        if (coordinates.length > 0) {
            // 기존 마커 및 폴리라인 삭제
            if (markerManager) {
                markerManager.removeMarkers();  // 기존 마커 삭제
                coordinates.forEach(([lat, lng]) => {
                    markerManager.addMarker(lat, lng);  // 각 좌표에 마커 추가
                });
            }

            if (polylineManager) {
                polylineManager.removePolyline();  // 기존 폴리라인 삭제
                polylineManager.addPolyline(coordinates);  // 좌표 배열을 한 번에 전달하여 폴리라인 그리기
            }
        }
    }, [coordinates]);

    // map이 초기화된 후에만 생성하도록 useMemo 사용
    const polylineManager = useMemo(() => map ? new PolylineManager(map) : null, [map]);
    const markerManager = useMemo(() => map ? new MarkerManager(map) : null, [map]);
    const gpsManager = useMemo(() => map ? new GpsManager(map) : null, [map]);
    const moveLocation = useMemo(() => map ? new MoveLocation(map) : null, [map]);

    // GPS 클릭 핸들러
    const handleGpsClick = () => {
        if (gpsManager) gpsManager.handleGpsClick();
    };

    // 마커 추가 및 제거
    const handleAddMarker = () => {
        if (markerManager) markerManager.addMarker(37.5825, 127.0103);
    };
    const handleRemoveMarkers = () => {
        if (markerManager) markerManager.removeMarkers();
    };

    // 폴리라인 추가 및 제거
    const handleAddPolyline = () => {
        if (polylineManager) polylineManager.addPolyline();
    };
    const handleRemovePolyline = () => {
        if (polylineManager) polylineManager.removePolyline();
    };

    //좌표 이동
    const handleMove = () => {
        if (location) {
            const moveLocation = new MoveLocation(map);
            moveLocation.handleLocationChange(location);
        }
    };
    const handleChange = (e) => {
        setLocation(e.target.value);  // 입력값 상태 업데이트
    };

    // textarea의 입력 변경 시 실행
    const handleTextareaChange = (e) => {
        if (!e || !e.target) return;

        const inputText = e.target.value;  // 입력값 바로 가져오기
        setTextareaInput(inputText);  // 입력값 상태 업데이트

        // 입력된 텍스트를 줄바꿈 기준으로 분리하여 좌표 배열로 변환
        const newCoordinates = inputText.split('\n').map(line => {
            const [lat, lng] = line.split(',').map(Number);
            return [lat, lng];
        }).filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));  // 유효한 좌표만 필터링

        // 좌표 배열을 위도(lat) 기준으로 오름차순 정렬
        // newCoordinates.sort((a, b) => a[0] - b[0]);  // a[0]이 lat 값, a[1]이 lng 값

        // 최단 거리 정렬로 대체
        const sortedCoords = CoordinateSorter.findShortestPath(newCoordinates);
        setCoordinates(sortedCoords);
        // setSortedCoordinates(sortedCoords);

        // 새로운 좌표 배열을 상태에 저장
        // setCoordinates(newCoordinates);
    };

    // 버튼 클릭 시 마커와 폴리라인 그리기
    const handleButtonClick = (e) => {
        e.preventDefault(); // 폼 리셋 방지

        // const inputText = textareaInput;  // textareaInput 상태에서 텍스트 가져오기
        const inputText = document.getElementById('hiddenLatLng').value

        const newCoordinates = inputText.split('\n').map(line => {
            const [lat, lng] = line.split(',').map(Number);
            return [lat, lng];
        }).filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));  // 유효한 좌표만 필터링

        // 최단 거리 정렬로 대체
        const sortedCoords = CoordinateSorter.findShortestPath(newCoordinates);
        setCoordinates(sortedCoords);

        //setCoordinates(newCoordinates);  // 좌표 상태 업데이트
        setTrigger(true);  // 트리거 상태 변경
    };

    return (
        <div>
            <div id="map" style={{ width: '100%', height: '500px' }}></div>
            <br />
            <div id="floatingList" style={{
                position: 'absolute',
                top: '300px', // 지도에서 리스트의 상단 위치 조정
                left: '40%', // 지도에서 리스트의 좌측 위치 조정
                width: '160px',
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
            </div>
            ㅡ이하 기능들은 테스트 용도이고, 추후 숨기거나 삭제할 예정입니다ㅡ<br />
            {/* <button onClick={handleGpsClick}>현재 위치 📍</button> <span /> */}
            <button onClick={handleAddMarker}>한성대 마커 추가</button> <span />
            <button onClick={handleRemoveMarkers}>전채 마커 삭제</button> <span />
            {/* <button onClick={handleAddPolyline}>폴리라인 추가</button> 에러뜸 */}
            <button onClick={handleRemovePolyline}>전체 폴리라인 삭제</button> <span />
            <textarea // 직접 좌표 이동
                style={{ height: "16px" }}
                type="text"
                placeholder="위도,경도로 입력"
                onChange={handleChange}
            />
            <button onClick={handleMove}>위치 이동</button>
            <br />
            <textarea // 위도 경도 파싱
                id="hiddenLatLng"
                onChange={handleTextareaChange}
                value={locations}
                placeholder="챗봇에서 위도,경도 자동 입력
                                (예: 37.5825, 127.0103)"
                style={{ width: '20%', height: '100px', whiteSpace: 'pre-line' }}
            ></textarea>
            <button style={{ width: "200px" }} onClick={handleButtonClick}>마커, 폴리라인 직접 추가</button>
            {/* <div>
                <h1>맛집 검색</h1>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} // 입력값 상태 업데이트
                    placeholder="맛집 이름 또는 주소 입력"
                />
                <button onClick={handleSearch}>검색</button>
                <textarea id='hiddenLatLng'>
                </textarea>
            </div> */}
        </div>
    );
};

export default MapComponent;