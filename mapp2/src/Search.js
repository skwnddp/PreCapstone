import React, { useState } from 'react';
import axios from 'axios';

const Search = () => {
  const [query, setQuery] = useState(''); // 검색어 상태
  const [results, setResults] = useState([]); // 검색 결과 상태
  const [loading, setLoading] = useState(false);  // 로딩 상태
  const [error, setError] = useState(null);  // 에러 상태

  // 좌표 변환 함수 (네이버 mapx, mapy -> 위도, 경도)
  const convertToLatLng = (x, y) => {
    const x1 = parseFloat(x);
    const y1 = parseFloat(y);
    const lat = y1 * 0.000008983148616 + 37.5665; // 변환 공식
    const lng = x1 * 0.000011931510 + 126.9780; // 변환 공식
    return { lat, lng };
  };

  // 네이버 검색 API 호출
  const handleSearch = async () => {
    if (!query) return;  // 검색어가 비어 있으면 리턴

    setLoading(true);  // 로딩 시작
    setError(null);  // 기존 에러 초기화

    const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&start=1&sort=random`;

    try {
      const response = await axios.get(url, {
        headers: {
          'X-Naver-Client-Id': process.env.REACT_APP_NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': process.env.REACT_APP_NAVER_CLIENT_SECRET,
        },
      });

      // 네이버 API 응답에서 items 데이터를 처리
      const items = response.data.items.map((item) => {
        const { lat, lng } = convertToLatLng(item.mapx, item.mapy);
        return {
          ...item,
          lat,
          lng,
        };
      });

      setResults(items);  // 검색 결과 업데이트
      console.log(response.data);  // 응답 확인
    } catch (error) {
      // 에러 발생 시 처리
      setError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Error fetching data:', error.response || error);
    } finally {
      setLoading(false);  // 로딩 종료
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>네이버 지역 검색</h2>
      <input
        type="text"
        placeholder="검색어를 입력하세요"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginRight: '10px' }}
      />
      <button onClick={handleSearch} disabled={loading}>검색</button>

      {loading && <p>검색 중...</p>}  {/* 로딩 상태 표시 */}
      {error && <p style={{ color: 'red' }}>{error}</p>}  {/* 에러 메시지 표시 */}

      <ul style={{ marginTop: '20px' }}>
        {results.map((item) => (
          <li key={item.link} style={{ marginBottom: '20px' }}>
            <h3 dangerouslySetInnerHTML={{ __html: item.title }} />
            <p>주소: {item.address}</p>
            <p>도로명 주소: {item.roadAddress}</p>
            <p>
              <strong>위도:</strong> {item.lat}, <strong>경도:</strong> {item.lng}
            </p>
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              자세히 보기
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;