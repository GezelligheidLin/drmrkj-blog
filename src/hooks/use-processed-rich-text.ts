import { computed, unref } from 'vue'

/**
 * 处理富文本字符串，为其中的相对路径图片添加指定前缀，并可选地移除一个已存在的前缀。
 * @param {Ref<string> | string} rawRichTextRef - 包含原始富文本字符串的 Ref 对象或普通字符串。
 * @param {Ref<string> | string} imagePrefixRef - 要添加到图片 src 的主要前缀 (例如 'http://xxx:xxxx/').
 * @param {Ref<string | null | undefined> | string | null | undefined} [prefixToRemoveRef] - (可选) 在添加 imagePrefix 之前，要从相对路径 src 开头移除的字符串。
 * @returns {object} 包含处理后的富文本 Ref 的对象 { processedRichText: ComputedRef<string> }
 */
export function useProcessedRichText(
  rawRichTextRef: Ref<string>,
  imagePrefixRef: Ref<string>,
  prefixToRemoveRef: string = '/web-api',
) {
  // 添加了 prefixToRemoveRef 参数
  // 使用 computed 来确保响应式
  const processedRichText = computed(() => {
    // 使用 unref 获取 Ref 的当前值，如果传入的是普通值则直接使用
    const rawValue = unref(rawRichTextRef)
    const mainPrefix = unref(imagePrefixRef) // 主要前缀
    const prefixToRemove = unref(prefixToRemoveRef) // 要移除的前缀

    if (!rawValue || typeof rawValue !== 'string') {
      console.warn('useProcessedRichText: rawRichText is empty or not a string.')
      return ''
    }
    if (!mainPrefix || typeof mainPrefix !== 'string') {
      console.warn('useProcessedRichText: imagePrefix is empty or not a string.')
      // 主要前缀无效时，返回原始值，因为核心功能无法执行
      return rawValue
    }

    // 确保主要前缀以 '/' 结尾，方便后续拼接
    const finalMainPrefix = mainPrefix.endsWith('/') ? mainPrefix : `${mainPrefix}/`

    // 检查 prefixToRemove 是否是有效的非空字符串
    const shouldRemovePrefix =
      prefixToRemove && typeof prefixToRemove === 'string' && prefixToRemove.length > 0

    try {
      // 使用 DOMParser 来解析 HTML 字符串
      const parser = new DOMParser()
      // 解析为 'text/html' 会创建一个完整的 HTML 文档结构
      const doc = parser.parseFromString(rawValue, 'text/html')

      // 选择文档主体（body）中的所有 <img> 标签
      const images = doc.body.querySelectorAll('img')

      images.forEach((img) => {
        const currentSrc = img.getAttribute('src')

        // 检查 src 是否存在，并且是相对路径
        if (
          currentSrc &&
          !currentSrc.startsWith('http://') &&
          !currentSrc.startsWith('https://') &&
          !currentSrc.startsWith('//') &&
          !currentSrc.startsWith('data:') &&
          !currentSrc.startsWith('blob:') // 排除 blob URL
        ) {
          let srcToProcess = currentSrc // 使用 let 声明，因为可能需要修改

          if (shouldRemovePrefix && srcToProcess.startsWith(prefixToRemove)) {
            // 截取掉指定的前缀
            srcToProcess = srcToProcess.substring(prefixToRemove.length)
            console.log(
              `Removed prefix "${prefixToRemove}" from: ${currentSrc}. Result: ${srcToProcess}`,
            ) // 调试信息
          }

          // 如果处理后的 src (srcToProcess) 以 '/' 开头，移除它，因为 finalMainPrefix 已经以 '/' 结尾
          const cleanSrc = srcToProcess.startsWith('/') ? srcToProcess.substring(1) : srcToProcess

          // 拼接最终的 src
          const newSrc = finalMainPrefix + cleanSrc
          img.setAttribute('src', newSrc)
          console.log(`Processed image src: ${currentSrc} -> ${newSrc}`) // 调试信息
        } else {
          // console.log(`Skipped image src: ${currentSrc}`); // 调试信息
        }
      })

      // 返回处理后文档 body 的 innerHTML
      return doc.body.innerHTML
    } catch (error) {
      console.error('Error processing rich text in useProcessedRichText:', error)
      return rawValue // 发生错误时返回原始值
    }
  })

  // 返回一个包含计算属性的对象，方便解构
  return {
    processedRichText,
  }
}
