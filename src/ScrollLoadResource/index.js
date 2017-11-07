import React, { PureComponent } from 'react'
import { debounce } from 'lodash'
import { createAsyncTaskQueue } from '../utils/index'
import './index.css'
const COUNT = 100
const COLUMN = 2
const TESTARRAY = []
for (let i = 0; i < COUNT; i++) {
  TESTARRAY.push({ title: `title${i}`, src: `${i}test.img`, index: i })
}
const HEIGHT = 110
const EXTRAHEIGHT = 10
const BASEGAP = HEIGHT + EXTRAHEIGHT
const testImage = 'https://modao.cc/images/landing/homepage/new/sec3@phone.png?20171012b'
const fetchImageResource = (src) => {
  return fetch(src).then(() => src)
}

// blob
// const fetchImageResourceWithBlob = (src) => {
//   return fetch(src).then(response => response.blob())
// }

const __ENV__ = process.env.NODE_ENV === 'development'

export default class ScrollLoadResource extends PureComponent {
  constructor (props) {
    super(props)
    this.debounceMouseWheel = debounce(this.handleMouseWheel, 500)
    this.cacheResource = []
  }

  componentDidMount () {
    this.offsetHeight = this.$elem.offsetHeight

    // 满屏容纳的图片数量
    this.fullScrrenImageCount = Math.ceil(this.offsetHeight / BASEGAP) * COLUMN
    // Object.keys(Array.apply(null, { length: this.fullScrrenImageCount }))
    // 有很大的区别，一个是 iterator 一个是非 iterator。有时间的话需要调研下
    // const firstScreenLoadArr = [...Array(this.fullScrrenImageCount).keys()]

    const firstScreenLoadArr = TESTARRAY.slice(0, this.fullScrrenImageCount)
    this.fetchResource(firstScreenLoadArr)
    this.$elem.addEventListener('mousewheel', this.debounceMouseWheel, false)
  }

  handleMouseWheel = () => {
    const loadImageResourceArr = this.calculateLoadResource()
    this.fetchResource(loadImageResourceArr)
  }

  calculateLoadResource = () => {
    const scrollTop = this.$elem.scrollTop
    // 最终加载的图片数量（过滤滑动过程中加载的图片）
    let loadImageResourceArr = []

    // 针对滑动未超过一屏的情况
    if (scrollTop < this.offsetHeight) {
      const loadScreenImageCount = Math.ceil(scrollTop / BASEGAP) * COLUMN
      for (let i = 0; i < loadScreenImageCount; i++) {
        // loadImageResourceArr.push(this.fullScrrenImageCount + i)

        loadImageResourceArr.push(TESTARRAY[this.fullScrrenImageCount + i])
      }
    } else {
      const loadImageScreenIndex = Math.floor(scrollTop / BASEGAP) * COLUMN
      // 在有些情况下，位移的顶部和底部各显示半张图片，因此会比满屏加载多一张，通过是否整除来判定
      const renderOneMore = (scrollTop / BASEGAP).toString().includes('.') ? 1 * COLUMN : 0
      for (let i = 0; i < this.fullScrrenImageCount + renderOneMore; i++) {

        loadImageScreenIndex + i < COUNT && loadImageResourceArr.push(TESTARRAY[loadImageScreenIndex + i])
      }
    }
    return loadImageResourceArr
  }

  renderImage = (dom, src) => {
    dom && (dom.style.background = `url(${src}) no-repeat center center`)
    dom && dom.classList.add('loaded')
  }

  // renderImageWithBlob = async (dom, blob) => {
  //   const fileReader = new FileReader()
  //   fileReader.readAsDataURL(blob)
  //   fileReader.onloadend = () => {
  //     dom.style.backgroundImage = `url(${fileReader.result})`
  //   }
  // }

  fetchResource = (resource) => {
    const { pushTask, getTaskQueueSize, resetTaskQueue } = createAsyncTaskQueue()
    resetTaskQueue()
    __ENV__ && console.log(`resource`, resource)
    __ENV__ && console.log(`cacheResource`, this.cacheResource)
    resource.forEach(({ title, src, index }) => {
      if (this.cacheResource.includes(src)) {
        __ENV__ && console.log('cached')
        return
      }
      pushTask(async () => {
        __ENV__ && console.log(`fetch Resources task add ${getTaskQueueSize()}`)
        // 确保请求的src是已经加载过的资源
        const fethSrc = await fetchImageResource(testImage)
        this.renderImage(this.$elem.children[index].children[0], fethSrc)
        this.cacheResource.push(src)
        // 这种方式就是从缓存中取数据，或者在图片资源加载完之后将其转换为 blob
        // const blobImage = await fetchImageResourceWithBlob(testImage)
      }).then(() => console.log('load task successed'))
    })
  }

  componentWillUnmount () {
    this.$elem.removeEventListener('mousewheel', this.debounceMouseWheel)
  }

  getContainerRef = ref => this.$elem = ref

  render () {
    return <div ref={this.getContainerRef} className="imageList">
      {TESTARRAY.map(({ title, src, index }) => <div key={index} data-src={src} className="imageItem" style={{ height: HEIGHT, marginBottom: EXTRAHEIGHT }}>
        <div className="imageContent"></div><span className="imageTitle">{title}</span>
      </div>)}
    </div>
  }
}
