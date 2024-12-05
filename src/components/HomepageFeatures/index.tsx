import clsx from 'clsx'
import Heading from '@theme/Heading'
import styles from './styles.module.css'

type FeatureItem = {
  title: string
  Svg: React.ComponentType<React.ComponentProps<'svg'>>
  description: JSX.Element
}

const FeatureList: FeatureItem[] = [
  {
    title: '标准兼容',
    Svg: null,
    description: (
      <>
       健壮的DICOM解析。支持DICOMweb和所有传输语法，开箱即用。
      </>
    ),
  },
  {
    title: '快速',
    Svg: null,
    description: (
      <>
        高性能GPU加速图像显示。多线程图像解码。渐进式数据流。
      </>
    ),
  },
  {
    title: '可扩展的',
    Svg: null,
    description: (
      <>
       设计为模块化。轻松创建您自己的工具和图像加载器。
      </>
    ),
  },
]

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        {/* <Svg className={styles.featureSvg} role="img" /> */}
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
