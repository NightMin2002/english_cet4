// data/chapter1_vocab.js
const chapter1Vocabulary = [{
		id: 'campus', // 唯一ID，方便查找
		word: 'Campus',
		pronunciation: '[ˈkæmpəs]',
		partOfSpeech: 'n.', // 词性
		meaning: '（大学）校园，校区',
		image: 'placeholder-campus.png', // 图片文件名或 URL (先用占位符)
		signVideoWord: 'campus-word.mp4', // 单词手语视频文件名或 URL (占位符)
		exampleSentence: 'Our university has a beautiful campus.',
		signVideoSentence: 'campus-sentence.mp4' // 例句手语视频 (占位符)
	},
	{
		id: 'student',
		word: 'Student',
		pronunciation: '[ˈstjuːdnt] / [ˈstuːdnt]',
		partOfSpeech: 'n.',
		meaning: '学生；研究者',
		image: 'placeholder-student.png',
		signVideoWord: 'student-word.mp4',
		exampleSentence: 'He is a college student.',
		signVideoSentence: 'student-sentence.mp4'
	},
	{
		id: 'study',
		word: 'Study',
		pronunciation: '[ˈstʌdi]',
		partOfSpeech: 'v. & n.', // 可以包含多种词性
		meaning: '学习，研究；细看；书房',
		image: 'placeholder-study.png',
		signVideoWord: 'study-word.mp4',
		exampleSentence: 'You need to study hard.',
		signVideoSentence: 'study-sentence.mp4'
	},
	// ... 添加更多单词对象 ...
	{
		id: 'library',
		word: 'Library',
		pronunciation: '[ˈlaɪbrəri]',
		partOfSpeech: 'n.',
		meaning: '图书馆，图书室；藏书',
		image: 'placeholder-library.png',
		signVideoWord: 'library-word.mp4',
		exampleSentence: 'I often go to the library.',
		signVideoSentence: 'library-sentence.mp4'
	},
	{
		id: 'course',
		word: 'Course',
		pronunciation: '[kɔːs] / [kɔːrs]',
		partOfSpeech: 'n.',
		meaning: '课程，科目；过程；一道菜',
		image: 'placeholder-course.png',
		signVideoWord: 'course-word.mp4',
		exampleSentence: 'Which course are you taking?',
		signVideoSentence: 'course-sentence.mp4'
	}
];

// 如果在其他 JS 文件中需要用到这个数据，可能需要导出
// export default chapter1Vocabulary; // 如果使用 ES Modules
// 或者保持全局变量（简单但不推荐），或者使用其他模块化方案
// 为了简单起见，我们先假设 page-vocab.js 能直接访问到这个变量