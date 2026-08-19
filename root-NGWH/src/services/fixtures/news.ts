import type { NewsArticle } from "@/types/content";

export const NEWS_FIXTURES: NewsArticle[] = [
  {
    id: "1",
    slug: "2026-championship-kickoff-announcement",
    category: "tournament_news",
    publishedAt: "2026-06-01",
    title: {
      en: "2026 NextGen Women Hoops Championship Kicks Off This Summer",
      vi: "Giải Bóng Rổ Nữ NextGen 2026 Chính Thức Khai Mạc Mùa Hè Này",
    },
    summary: {
      en: "Top regional clubs prepare to compete for the national title as official tournament dates and venue schedules are unveiled.",
      vi: "Các câu lạc bộ hàng đầu khu vực đã sẵn sàng tranh tài giành ngôi vô địch quốc gia khi lịch trình và địa điểm thi đấu chính thức được công bố.",
    },
    body: {
      en: "The 2026 NextGen Women Hoops Championship brings together 16 elite basketball clubs across the country. Featuring an expanded group stage and single-elimination playoffs, this season promises high-octane action, sportsmanship, and historic matchups.",
      vi: "Giải bóng rổ nữ NextGen 2026 quy tụ 16 câu lạc bộ xuất sắc trên toàn quốc. Với thể thức thi đấu vòng bảng mở rộng và vòng knock-out kịch tính, mùa giải năm nay hứa hẹn mang đến những trận đấu đỉnh cao và tinh thần thể thao cao đẹp.",
    },
    coverImage: {
      src: "/assets/img/herosection.png",
      alt: {
        en: "2026 NextGen Women Hoops Championship Opening Match",
        vi: "Trận khai mạc Giải bóng rổ nữ NextGen 2026",
      },
    },
  },
  {
    id: "2",
    slug: "rising-star-journey-to-the-top",
    category: "inspirational",
    publishedAt: "2026-05-20",
    title: {
      en: "Rising Star: Mai Anh's Journey to the National Stage",
      vi: "Ngôi Sao Đang Lên: Hành Trình Đến Đấu Trường Quốc Gia Của Mai Anh",
    },
    summary: {
      en: "From local youth academy standout to team captain, discover how dedication and teamwork shaped one of the league's most compelling stories.",
      vi: "Từ học viện bóng rổ trẻ địa phương đến tấm băng đội trưởng, khám phá nỗ lực và tinh thần đồng đội của một trong những gương mặt truyền cảm hứng nhất giải đấu.",
    },
    body: {
      en: "Mai Anh's transition from youth training camps to leading Hanoi Dragons' offensive unit highlights the power of structured player development in women's basketball. Her relentless work ethic serves as an inspiration for the next generation of female athletes.",
      vi: "Hành trình từ các trại huấn luyện trẻ đến vị trí dẫn dắt hàng công Hanoi Dragons khẳng định hiệu quả của công tác đào tạo trẻ trong bóng rổ nữ. Tinh thần tập luyện bền bỉ của Mai Anh là nguồn cảm hứng lớn cho các thế hệ vận động viên trẻ.",
    },
  },
  {
    id: "3",
    slug: "nutrition-and-recovery-for-female-athletes",
    category: "knowledge_nutrition",
    publishedAt: "2026-05-10",
    title: {
      en: "Game-Day Nutrition & Hydration Strategies for Basketball Players",
      vi: "Chiến Lược Dinh Dưỡng Vàng Và Hydrat Hóa Cho Vận Động Viên Bóng Rổ",
    },
    summary: {
      en: "Sports nutrition specialists share key guidelines on pre-game fueling, endurance maintenance, and post-match muscle recovery.",
      vi: "Chuyên gia dinh dưỡng thể thao chia sẻ các nguyên tắc quan trọng về nạp năng lượng trước trận đấu và phục hồi thể lực sau giờ thi đấu.",
    },
    body: {
      en: "Optimal performance on the court requires strategic fueling before, during, and after competitive matches. Learn how complex carbohydrates, hydration protocols, and targeted post-game recovery meals help athletes maintain peak physical condition throughout the tournament.",
      vi: "Hiệu suất thi đấu tối ưu trên sân đòi hỏi chiến lược nạp năng lượng khoa học trước, trong và sau trận đấu. Tìm hiểu cách sử dụng carbohydrate phức hợp, bổ sung điện giải và dinh dưỡng phục hồi giúp vận động viên duy trì thể lực sung mãn.",
    },
  },
  {
    id: "4",
    slug: "behind-the-scenes-training-camp-insights",
    category: "tournament_news",
    publishedAt: "2026-04-28",
    title: {
      en: "Inside the Pre-Season Intensive Training Camp",
      vi: "Bên Trong Trại Huấn Luyện Cường Độ Cao Trước Mùa Giải",
    },
    summary: {
      en: "Coaches and athletic trainers focus on tactical execution, conditioning drills, and squad chemistry ahead of the opening fixtures.",
      vi: "Ban huấn luyện tập trung vào chiến thuật, thể lực và sự gắn kết đội hình nhằm chuẩn bị tốt nhất cho các trận đấu mở màn.",
    },
    body: {
      en: "Go behind the scenes as participating clubs complete rigorous double-session training routines. From strength conditioning to video analysis, teams are leaving no stone unturned in their preparation for championship contention.",
      vi: "Khám phá hậu trường buổi tập của các đội bóng trước thềm mùa giải mới. Từ các bài tập thể lực chuyên sâu đến phân tích băng hình chiến thuật, tất cả đều hướng tới mục tiêu chinh phục ngôi vị cao nhất.",
    },
  },
];
