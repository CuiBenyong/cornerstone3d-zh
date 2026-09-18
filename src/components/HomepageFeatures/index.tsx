import Heading from '@theme/Heading'
import styles from './styles.module.css'

type FeatureItem = {
  title: string
  description: string
}

/**
 * Cornerstone3D 的核心特性。
 *
 * 文案按"它解决什么问题"来写，而不是堆形容词。医学影像有它特有的约束——
 * 数据量大、传输语法繁多、需要同屏显示多个视口——说清这些约束比说"快"更有信息量。
 */
const FEATURES: FeatureItem[] = [
  {
    title: '符合 DICOM 标准',
    description:
      '完整的 DICOM 解析能力，支持 DICOMweb 协议与各类传输语法，包括 JPEG 2000、HTJ2K 等压缩格式，无需额外配置即可读取常见来源的影像数据。',
  },
  {
    title: 'GPU 加速渲染',
    description:
      '基于 WebGL 的渲染管线，多个视口共享同一份 GPU 纹理内存，因此能在 PET/CT 融合这类需要同屏十几个视口的场景下正常工作。影像解码在 Web Worker 中并行进行，配合渐进式加载让大体数据尽早出图。',
  },
  {
    title: '可扩展的模块设计',
    description:
      '影像加载器、元数据提供者、标注工具都是可替换的模块。接入自有 PACS 或实现一个新的测量工具，只需按接口注册，不用改动渲染内核。',
  },
]

function Feature({ title, description }: FeatureItem) {
  return (
    <div className="col col--4">
      <div className={styles.feature}>
        <Heading as="h2" className={styles.featureTitle}>
          {title}
        </Heading>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FEATURES.map((feature) => (
            <Feature key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
