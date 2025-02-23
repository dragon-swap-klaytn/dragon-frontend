/* eslint-disable no-param-reassign */

/**
 * Represents a node in the doubly linked list used by the LRU cache.
 */
export type Node<T> = {
  key: string
  value: T
  prev: Node<T> | null
  next: Node<T> | null
}

/**
 * Options for creating the LRU cache.
 */
export type CacheOptions = {
  maxSize?: number
}

/**
 * The public API of the LRU cache.
 */
export type LRUCache<T> = {
  /**
   * Returns a copy of the internal cache map.
   */
  getAll: () => Map<string, Node<T>>
  /**
   * Gets a value from the cache by key.
   */
  get: (key: string) => T | null
  /**
   * Puts a key-value pair into the cache.
   */
  put: (key: string, value: T) => void
  /**
   * Removes an entry from the cache by key.
   */
  remove: (key: string) => void
}

/**
 * Creates a local LRU cache with a maximum size.
 *
 * @param options Options including the maximum size of the cache.
 */
export function createLocalLRUCache<T = any>({ maxSize = 1000 }: CacheOptions = {}): LRUCache<T> {
  // validate the maxSize
  if (maxSize <= 0) {
    throw new Error('maxSize must be a positive number')
  }

  // The internal cache map.
  const cache = new Map<string, Node<T>>()

  // Head and tail of the doubly linked list.
  let head: Node<T> | null = null
  let tail: Node<T> | null = null

  // Low-level helper to unlink a node from its current position.
  const unlinkNode = (node: Node<T>): void => {
    if (node.prev) {
      node.prev.next = node.next
    }
    if (node.next) {
      node.next.prev = node.prev
    }
    if (node === head) {
      head = node.next
    }
    if (node === tail) {
      tail = node.prev
    }
  }

  // Inside privateMethods: state-dependent operations.
  const privateMethods = {
    addToHead: (node: Node<T>): void => {
      node.prev = null
      node.next = head
      if (head) {
        head.prev = node
      }
      head = node
      if (!tail) {
        tail = node
      }
    },

    moveToHead: (node: Node<T>): void => {
      if (node === head) {
        return
      }
      unlinkNode(node)
      privateMethods.addToHead(node)
    },

    removeTail: (): void => {
      if (!tail || !cache.has(tail.key)) {
        return
      }
      cache.delete(tail.key)
      if (head === tail) {
        head = null
        tail = null
      } else {
        tail = tail.prev
        if (tail) {
          tail.next = null
        }
      }
    },

    moveToTail: (node: Node<T>): void => {
      if (node === tail) {
        return
      }
      unlinkNode(node)
      // Insert at the tail.
      node.prev = tail
      node.next = null
      if (tail) {
        tail.next = node
      }
      tail = node
    },
  }

  // Public API.
  const publicAPI: LRUCache<T> = {
    /**
     * Returns a copy of the internal cache map.
     * The reason for returning a copy is to prevent the caller from modifying the internal cache.
     */
    getAll: (): Map<string, Node<T>> => new Map(cache),

    /**
     * Gets the value associated with the given key.
     */
    get: (key: string): T | null => {
      const node = cache.get(key)
      if (!node) {
        return null
      }
      privateMethods.moveToHead(node)
      return node.value
    },

    /**
     * Inserts or updates a key-value pair in the cache.
     */
    put: (key: string, value: T): void => {
      let node = cache.get(key)
      if (node) {
        // Update existing node and move it to the head.
        node.value = value
        privateMethods.moveToHead(node)
      } else {
        // Create a new node.
        node = { key, value, prev: null, next: null }
        if (cache.size >= maxSize) {
          privateMethods.removeTail()
        }
        privateMethods.addToHead(node)
        cache.set(key, node)
      }
    },

    /**
     * Removes an entry from the cache by key.
     */
    remove: (key: string): void => {
      const node = cache.get(key)
      if (!node) {
        return
      }
      privateMethods.moveToTail(node)
      privateMethods.removeTail()
    },
  }

  return publicAPI
}
