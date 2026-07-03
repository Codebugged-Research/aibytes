import Foundation

// MARK: - Curriculum

struct Curriculum: Codable {
    let app: String
    let units: [Unit]
}

struct Unit: Codable, Identifiable {
    let id: Int
    let title: String
    let tier: String
    let tierIcon: String
    let lessons: [LessonMeta]
}

struct LessonMeta: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let icon: String
}

// MARK: - Lesson content

struct Lesson: Codable, Identifiable {
    let id: String
    let unit: Int
    let day: Int
    let tier: String
    let tierIcon: String
    let title: String
    let icon: String
    let concept: String
    let xp: Int
    let hearts: Int
    let estMinutes: Int
    let segments: [Segment]
}

struct Segment: Codable {
    let type: String                 // teach | practice | boss
    let cards: [Card]?
    let exercises: [Exercise]?
}

struct Card: Codable, Identifiable {
    var id: String { (kind ?? "") + (title ?? "") }
    let kind: String?
    let icon: String?
    let title: String?
    let body: String?
    let compare: Compare?
}

struct Compare: Codable {
    let left: CompareSide
    let right: CompareSide
}

struct CompareSide: Codable {
    let emoji: String
    let tag: String
    let text: String
}

struct Exercise: Codable, Identifiable {
    let id: String
    let type: String                 // true_false | multiple_choice | fill_blank | spot_the_ai
    let xp: Int
    let prompt: String
    let options: [Option]?
    let explain: String
    // fill_blank only
    let sentence: String?
    let blank: String?
    let words: [String]?
}

struct Option: Codable, Identifiable {
    let id: String
    let text: String
    let correct: Bool
}

// MARK: - Auth / progress DTOs (match backend JSON)

struct AuthResponse: Codable {
    let token: String
    let user: User
    let progress: Progress
}

struct User: Codable {
    let id: Int
    let email: String
    let name: String
    let authMethod: String
    let phone: String?
}

struct Progress: Codable {
    var xp: Int
    var streak: Int
    var lastLessonDate: String?
    var currentLesson: String
    var completedLessons: [String]
    var lessonProgress: [String: LessonPoint]

    static let empty = Progress(xp: 0, streak: 0, lastLessonDate: nil,
                                currentLesson: "u0-l1", completedLessons: [],
                                lessonProgress: [:])
}

struct LessonPoint: Codable {
    let segmentIndex: Int
    let exerciseIndex: Int
}

// MARK: - Chat

struct ChatMessage: Identifiable, Equatable {
    let id = UUID()
    let role: String                 // user | assistant
    var content: String
}
