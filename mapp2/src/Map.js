import React, { useState, useEffect, useMemo } from 'react';

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
                position: window.naver.maps.Position.RIGHT_CENTER,
            },
        });
        // EX mapManager.setCenter(lat, lng); 새로운 좌표로 지도 중심 변경
        this.setMap(map); // map 상태를 업데이트

        // 반환된 map 객체를 통해 setCenter 함수 추가
        map.setCenter(new window.naver.maps.LatLng(37.5665, 126.9780)); // 기본 중심을 설정

        // 함수 추가: 주어진 a, b 좌표로 지도 중심 변경
        this.setCenter = (a, b) => {
            const latLng = new window.naver.maps.LatLng(a, b);
            map.setCenter(latLng); // 새로운 좌표로 지도 중심을 설정
        };

        // 이하 GPS 버튼 속성들 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
        // 버튼 생성
        const button = document.createElement('button');
        button.innerHTML = '⚙ 내 위치';
        button.style.position = 'absolute';
        button.style.top = '10px';
        button.style.right = '10px';
        button.style.zIndex = '1000';
        button.style.padding = '12px 12px';
        // button.style.background = 'linear-gradient(45deg, #050042, #00BFFF)';
        // button.style.color = '#ffffff';

        button.style.backgroundColor = 'rgb(32, 32, 32, 0.8)';
        button.style.color = 'rgb(235, 60, 0)';
        button.style.borderRadius = '30px';
        button.style.fontSize = '14px';
        button.style.border = 'none';
        button.style.fontWeight = 'bold';
        button.style.cursor = 'pointer';
        button.style.transition = 'all 0.2s ease';

        // 호버 및 클릭 효과 추가
        button.addEventListener('mouseover', () => {
            button.style.background = 'linear-gradient(45deg, rgb(32, 32, 32), #4a4a4a)';
            button.style.transform = 'translateY(-1px)';
        });

        button.addEventListener('mouseout', () => {
            button.style.background = 'rgb(32, 32, 32)';
            button.style.transform = 'translateY(0)';
        });

        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(1px)';
        });

        button.addEventListener('mouseup', () => {
            button.style.transform = 'translateY(0)';
        });
        // 이상 GPS 버튼 속성들 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

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
            alert("GPS를 지원하지 않는 브라우저에요");
        }
    }
}

// 폴리라인 관리 클래스
class PolylineManager {
    constructor(map) {
        this.map = map;
        this.polylines = []; // 폴리라인 상태를 클래스 속성으로 관리
    }

    // 사용 보류
    addCustomPolyline = () => {
        // 폴리라인의 경로를 설정
        const path = [
            new window.naver.maps.LatLng(37.5825, 127.0103), // 한성대학교
            new window.naver.maps.LatLng(37.5850, 127.0150), // 임의의 다른 위치
            new window.naver.maps.LatLng(37.6000, 127.0200)  // 또 다른 위치
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
            strokeWeight: 10,                   // 폴리라인 두께
            strokeOpacity: 0.5,
            map: this.map,
        });

        // 그라데이션 애니메이션
        let startColor = { r: 188, g: 188, b: 188 };  // 초기 색상 (흰색)
        let endColor = { r: 0, g: 0, b: 0 };         // 끝 색상 (검정색)
        let currentTime = 0;  // 애니메이션 시간

        // 그라데이션 애니메이션 함수
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

// CustomOverlay 변수를 전역에서 선언
let CustomOverlay = null;

// 네이버 지도 API가 로드된 후 CustomOverlay 클래스 정의 및 그리기
function initCustomOverlay() {
    if (window.naver && window.naver.maps) {
        // console.log("커스텀 오버레이 다중 이니셜라이징")
        CustomOverlay = class extends window.naver.maps.OverlayView {
            constructor({ position, content, map, onClick }) {
                super();
                this.position = position;
                this.content = content;
                this.map = map;
                this.div = null;
                this.onClick = onClick;

                // 오버레이를 지도에 추가
                this.setMap(map);
            }

            // 오버레이가 지도에 추가될 때 호출
            onAdd() {
                const div = document.createElement('div');
                div.style.position = 'absolute';
                div.style.padding = '12px';
                div.style.border = "1px solid white"
                div.style.background = 'linear-gradient(45deg, rgb(32, 32, 32, 0.8) 100%, rgb(32, 32, 32, 0.4) 100%)';
                // 그라데이션
                div.style.borderRadius = '20px';
                div.style.textAlign = 'center';
                div.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
                div.style.fontWeight = 'bold';
                div.style.fontSize = '16px';
                div.style.color = 'white !important';
                div.style.fontFamily = "Noto Sans KR";
                div.style.cursor = 'pointer'; // 클릭 가능한 커서 모양

                // 3D 회전 애니메이션
                div.style.animation = 'rotate3D 4s infinite linear';

                // 파싱 작업
                console.log(this.content);
                const ParseResult = this.content.match(/>([^<]*)</g);

                const modifiedResult = ParseResult.map(match => {

                    const text = match.slice(0, match.length);
                    const modifiedText = text.slice(2, text.length - 1);
                    const resultWithPrefix = '🍚 ' + modifiedText;  // 임의로 추가할 문자

                    return resultWithPrefix;
                });

                // 결과를 div에 설정
                div.textContent = modifiedResult.join(", ");  // 여러 개의 텍스트를 구분해서 표시하려면 join 사용

                this.div = div;

                // 클릭 이벤트 추가
                div.addEventListener('click', () => {
                    if (this.onClick) {
                        this.onClick(this.position, this.content); // 클릭 시 핸들러 호출
                    }
                });

                const panes = this.getPanes();
                panes.overlayLayer.appendChild(div);

                // 애니메이션 정의 추가
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes rotate3D {
                        0% {
                            transform: rotateX(0deg) rotateY(0deg);
                        }
                        40% {
                            transform: rotateX(2deg) rotateY(30deg);
                        }
                        50% {
                            transform: rotateX(0deg) rotateY(90deg);
                        }
                        60% {
                            transform: rotateX(-2deg) rotateY(60deg);
                        }
                        100% {
                            transform: rotateX(0deg) rotateY(0deg);
                        }
                    }
                `;
                style.color = "white";
                document.head.appendChild(style);
            }

            // 오버레이가 새로 그려질 때마다 호출
            draw() {
                if (!this.div) return;
                const projection = this.getProjection();
                const point = projection.fromCoordToOffset(this.position);

                this.div.style.left = `${point.x - this.div.offsetWidth / 2}px`;
                this.div.style.top = `${point.y - this.div.offsetHeight - 30}px`;
            }

            // 오버레이가 지도에서 제거될 때 호출
            onRemove() {
                if (this.div) {
                    this.div.parentNode.removeChild(this.div);
                    this.div = null;
                }
            }
        };
    } else {
        console.error("네이버 지도 API가 로드되지 않았습니다.");
    }
}

// 왜 latitude 위도만 이상한 시네마틱 값으로 전달해서 Nan 처리 되는건지 이해 불가능 > 이유 모르겟는데 아무튼 해결됨
// 마커 및 정보 생성, 삭제
class MarkerManager {
    constructor(map) {
        this.map = map;
        this.markers = [];
    }

    // 마커와 오버레이 추가
    addMarker(lat, lng, content) {
        if (!this.map || !window.naver || !CustomOverlay) {
            console.error("CustomOverlay가 로드되지 않았거나, 네이버 지도 API가 로드되지 않았습니다.");
            return;
        }

        const position = new window.naver.maps.LatLng(lat, lng);

        // 마커 생성
        const marker = new window.naver.maps.Marker({
            position,
            map: this.map,
            icon: {
                url: './markerImage.png',
                size: new window.naver.maps.Size(24, 24),
                origin: new window.naver.maps.Point(0, 0),
                anchor: new window.naver.maps.Point(0, 24)
            },
            animation: window.naver.maps.Animation.DROP
        });

        // 사용자 정의 오버레이 생성
        const overlay = new CustomOverlay({
            position,
            content,
            map: this.map,
            onClick: (position, content) => {
                alert(`플로팅 바에서 맛집을 클릭해 정보와 리뷰를 확인하세요!`);
            }
        });

        this.markers.push({ marker, overlay });
    }

    // 모든 마커와 오버레이 제거
    removeMarkers() {
        this.markers.forEach(({ marker, overlay }) => {
            marker.setMap(null);
            overlay.setMap(null);
        });
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

// 지도 내 latlng 기반 좌표로 이동
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

// 그리드, 선분 교차 판정 알고리즘
class CoordinateSorter {
    // 두 점 사이의 거리 계산 메서드
    static calculateDistance(point1, point2) {
        const [lat1, lng1] = point1;
        const [lat2, lng2] = point2;
        return Math.sqrt((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2);
    }

    // 교차 여부 확인 함수
    static isIntersecting(p1, p2, q1, q2) {
        const orientation = (a, b, c) =>
            (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1]);

        const o1 = orientation(p1, p2, q1);
        const o2 = orientation(p1, p2, q2);
        const o3 = orientation(q1, q2, p1);
        const o4 = orientation(q1, q2, p2);

        return o1 * o2 < 0 && o3 * o4 < 0;
    }

    // 경로에서 교차하는 선분을 수정하는 함수
    static fixIntersections(path, points) {
        const n = path.length;
        let modified = true;

        while (modified) {
            modified = false;
            for (let i = 0; i < n - 2; i++) {
                for (let j = i + 2; j < n - 1; j++) {
                    const p1 = points[path[i]];
                    const p2 = points[path[i + 1]];
                    const q1 = points[path[j]];
                    const q2 = points[path[j + 1]];

                    if (CoordinateSorter.isIntersecting(p1, p2, q1, q2)) {
                        // 교차 발생 시 경로 수정 (두 선분을 스왑)
                        [path[i + 1], path[j]] = [path[j], path[i + 1]];
                        modified = true;
                    }
                }
            }
        }
        return path;
    }

    // 최단 거리 경로를 찾는 메서드 (탐욕적 알고리즘)
    static findShortestPath(points) {
        const n = points.length;
        if (n === 0) return [];

        // 포인트들을 오름차순으로 정렬
        points.sort((a, b) => {
            return a[0] - b[0] || a[1] - b[1]; // x, y 값에 대해 오름차순 정렬
        });

        const visited = new Array(n).fill(false);
        const path = [0]; // 첫 번째 점을 시작점으로 선택
        visited[0] = true;

        // 탐욕적 알고리즘을 사용하여 최단 경로 찾기
        for (let i = 1; i < n; i++) {
            const lastPointIndex = path[path.length - 1];
            let nearestIndex = -1;
            let minDistance = Infinity;

            // 방문하지 않은 점 중에서 가장 가까운 점 찾기
            for (let j = 0; j < n; j++) {
                if (!visited[j]) {
                    const dist = CoordinateSorter.calculateDistance(
                        points[lastPointIndex],
                        points[j]
                    );
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

        // 교차 수정 알고리즘 적용
        return CoordinateSorter.fixIntersections(path, points).map(
            (index) => points[index]
        );
    }
}

// 지도 컴포넌트
export const MapComponent = ({ locations, buttonRef }) => {
    // console.log("컴포넌트 실행 시점");
    const [map, setMap] = useState(null);
    const [location, setLocation] = useState('');  // 위치 상태
    const [searchQuery, setSearchQuery] = useState('');
    const [textareaInput, setTextareaInput] = useState('');
    const [coordinates, setCoordinates] = useState([]);
    const [sortedCoordinates, setSortedCoordinates] = useState([]);
    const [trigger, setTrigger] = useState(false); // 버튼 클릭 트리거 상태
    const [isListVisible, setIsListVisible] = useState(false);

    const toggleListVisibility = () => {
        setIsListVisible(prevState => !prevState);
    };

    useEffect(() => {
        console.log("지도 객체 초기화 시점");
        const mapManager = new MapManager(process.env.REACT_APP_MAP_KEY, setMap);
        const removeScript = mapManager.loadMapScript(() => {
            const initializedMap = mapManager.initMap();
            setMap(initializedMap);
            initCustomOverlay();
            // 맵 로드 이후 커스텀 오버레이 함수 강제 호출 > 클래스 인스턴스 Lazy 하게 생성 ㄱㄱ
        });
        return () => removeScript();
    }, []);

    useEffect(() => {
        if (coordinates.length > 0 && map) {

            if (polylineManager) {
                polylineManager.removePolyline();  // 기존 폴리라인 삭제
                polylineManager.addPolyline(sortedCoordinates);  // 좌표 배열을 한 번에 전달하여 정렬된 폴리라인 그리기
            }

            if (markerManager) {
                markerManager.removeMarkers();  // 기존 마커 삭제

                // hiddenDiv 요소 가져오기
                const hiddenDiv = document.getElementById('hiddenDiv'); // 텍스트박스 요소
                const htmlContent = hiddenDiv.value;  // 텍스트박스의 값을 가져옴 (HTML 문자열)

                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');  // 문자열을 HTML 문서로 파싱
                const restaurantDivs = doc.querySelectorAll('div');  // 파싱된 문서에서 모든 <div> 요소 가져오기

                coordinates.forEach(([lat, lng], index) => {
                    // 짝수 인덱스에 해당하는 <div>만 사용
                    const currentDiv = restaurantDivs[index * 2];  // 짝수 인덱스만 선택 (index * 2)
                    const name = currentDiv ? currentDiv.textContent.trim() : ' 이름 없음 ';  // 텍스트 추출

                    // 이름에 스타일을 적용하여 출력
                    const styledName = `<div>${name}</div>`;

                    // 마커 생성
                    markerManager.addMarker(lat, lng, styledName);
                });
            }

            // LatLngBounds 객체 생성
            const bounds = new window.naver.maps.LatLngBounds();
            // 현재 줌 레벨 가져오기
            const currentZoom = map.getZoom();

            // 새로운 좌표들을 모두 LatLngBounds 객체에 포함시킴
            coordinates.forEach(coord => {
                bounds.extend(new window.naver.maps.LatLng(coord[0], coord[1]));  // 각 좌표 추가
            });

            // fitBounds 호출하여 좌표 범위에 맞게 지도 확장
            console.log(bounds);
            map.fitBounds(bounds);
            // 줌 레벨 보정 누적 돼서 일단 빼기
            // map.setZoom(currentZoom - 1);
        }
    }, [coordinates, map]);  // coordinates나 map 상태가 변경될 때마다 실행

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

        // 새로운 배열로 상태 업데이트 해야만 정렬 방지되네...
        setCoordinates([...newCoordinates]);

        // 최단 거리 정렬로 대체
        const sortedCoords = CoordinateSorter.findShortestPath(newCoordinates);
        setSortedCoordinates([...sortedCoords]);
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

        // console.log(inputText);
        // console.log(newCoordinates); // 여기에서 자동으로 정렬이 되는 이유가 머임??

        // 새로운 배열로 상태 업데이트 해야만 정렬 이벤트 호출이 방지되네...
        setCoordinates([...newCoordinates]);

        // 최단 거리 정렬로 대체
        const sortedCoords = CoordinateSorter.findShortestPath(newCoordinates);
        setSortedCoordinates([...sortedCoords]);

        setTrigger(true);  // 트리거 상태 변경
    };

    return (
        <div>
            <div id="map" className='map'>
                <br />
                <div id="floatingList" style={{
                    visibility: isListVisible ? 'visible' : 'hidden',
                    opacity: isListVisible ? 1 : 0, // opacity로 부드럽게 사라지거나 나타나도록 설정
                    transition: 'visibility 0s, opacity 0.5s ease', // visibility와 opacity에 전환 효과 추가
                    position: 'absolute',
                    top: '280px', // 지도에서 리스트의 상단 위치 조정
                    left: '410px', // 지도에서 리스트의 좌측 위치 조정
                    width: '160px',
                    height: '200px',
                    border: '2px solid black',
                    borderRadius: "20px",
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    backgroundColor: 'rgb(32, 32, 32, 0.8)', // 배경 색상 투명하게 설정 (선택사항)
                    color: 'black', // 글자는 불투명하게 설정
                    zIndex: 1 // 리스트가 지도 위로 오도록 설정
                }}>
                </div>
                <button
                    className="floating-button"
                    style={{
                        position: 'absolute',
                        top: '495px', // 지도에서 리스트의 상단 위치 조정
                        left: '440px', // 지도에서 리스트의 좌측 위치 조정}
                        width: '120px',
                        height: '40px',
                        zIndex: 1, // 리스트가 지도 위로 오도록 설정
                        // borderRadius: '20px',
                        // backgroundColor: 'rgb(32, 32, 32)',
                        // color: 'rgb(235, 60, 0)',
                        fontWeight: 'bold'
                    }} onClick={toggleListVisibility}>
                    {isListVisible ? '플로팅 끄기' : '플로팅 켜기'}
                </button>
            </div>

            < br />
            {/* ㅡ이하 기능들은 테스트 용도이고, 추후 숨기거나 삭제할 예정입니다ㅡ */}
            < br />

            <div className='hide'>
                {/* <button onClick={handleGpsClick}>현재 위치 📍</button> <span /> */}
                < button onClick={handleAddMarker} > 한성대 마커 추가</button > <span />
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
                    style={{ width: '20%', height: '50px', whiteSpace: 'pre-line' }}
                ></textarea>
                {/* <button id="handleButtonClick" style={{ width: "200px" }} onClick={handleButtonClick}>마커, 폴리라인 직접 추가</button> */}

                {/* 플로팅 바에 가져올 내용, 지도 내 info 창에 띄울 내용 */}
                <textarea id="hiddenDiv"></textarea>
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

            </div >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                <button id="handleButtonClick" ref={buttonRef} className='floating-button' style={{ width: "200px", height: "40px" }} onClick={handleButtonClick}>
                    맛집 새로고침 ⟳
                </button>
            </div>
        </div>
    );
};

export default MapComponent;