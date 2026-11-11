CREATE DATABASE store_demo CHARACTER SET utf8mb4;
USE store_demo;
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  category VARCHAR(20),
  price INT NOT NULL,
  stock INT,
  added_on DATE
);
ALTER TABLE products ADD memo VARCHAR(100);
INSERT INTO products (name, category, price, stock, added_on)
VALUES
  ('무선 마우스', '전자', 18000, 12, '2026-10-01'),
  ('기계식 키보드', '전자', 55000, 5, '2026-10-02'),
  ('USB 허브', '전자', 25000, 8, '2026-10-03'),
  ('스프링 노트', '문구', 3000, 30, '2026-10-04'),
  ('검정 볼펜', '문구', 1500, 50, '2026-10-05'),
  ('텀블러', '생활', 12000, 10, '2026-10-06'),
  ('머그컵', '생활', 8000, 15, '2026-10-07'),
  ('충전 케이블', '전자', 9000, 20, '2026-10-08'),
  ('형광펜 세트', '문구', 5000, 25, '2026-10-09'),
  ('장바구니', '생활', 4000, 18, '2026-10-10'),
  ('선물 포장', NULL, 1000, NULL, '2026-10-11'),
  ('노트북 파우치', '생활', 22000, 6, '2026-10-12');
