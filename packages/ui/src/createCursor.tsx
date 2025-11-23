export const createCircleCursor = (size: number, color: string) => {
    
    const svg = `
      <svg
        width="${size + 4}"
        height="${size + 4}"
        viewBox="0 0 ${size + 4} ${size + 4}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="${(size + 4) / 2}"
          cy="${(size + 4) / 2}"
          r="${size / 2}"
          stroke="${color}"
          stroke-width="1.5"
          fill="none"
        />
      </svg>
    `;

    return `url('data:image/svg+xml;base64,${btoa(svg)}') ${size / 2 + 2} ${size / 2 + 2}, auto`;
};