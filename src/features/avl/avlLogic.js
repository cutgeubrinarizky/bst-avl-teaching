export const lessonPoints = [
  "Balanced BST menjaga tinggi pohon mendekati O(log n).",
  "AVL menyimpan balance factor (BF = tinggi kiri - tinggi kanan).",
  "Node valid jika BF di rentang -1 sampai 1.",
  "Jika tidak valid, lakukan rotasi (single/double) pada node kritis terdalam.",
];

export const SOURCE_CODE_DETAILS = {
  create: {
    label: "Create Node",
    title: "Kode Membuat Node Baru",
    subtitle: "Bagian awal AVL: setiap data baru harus dibuat sebagai node lengkap dengan pointer kiri, kanan, dan height.",
    code: `struct Node {
  int key;
  struct Node *left;
  struct Node *right;
  int height;
};

struct Node *newNode(int key) {
  struct Node *node = (struct Node *)malloc(sizeof(struct Node));
  node->key = key;
  node->left = NULL;
  node->right = NULL;
  node->height = 1;

  return node;
}`,
    bullets: [
      "Struct Node menyimpan key, anak kiri, anak kanan, dan height.",
      "malloc dipakai untuk menyediakan memori node baru.",
      "Node baru selalu dimulai sebagai daun, jadi left dan right bernilai NULL.",
      "Height awal 1 karena node daun dihitung punya tinggi 1.",
      "Fungsi mengembalikan alamat node agar bisa dipasang ke tree.",
    ],
    blocks: [
      {
        title: "1. Struktur data node",
        code: `struct Node {
  int key;
  struct Node *left;
  struct Node *right;
  int height;
};`,
        explain:
          "AVL tetap memakai struktur BST, tetapi ditambah height. Height inilah yang membuat program bisa menghitung balance factor.",
      },
      {
        title: "2. Alokasi memori node",
        code: `struct Node *node = (struct Node *)malloc(sizeof(struct Node));`,
        explain:
          "malloc membuat ruang di memori untuk satu node. Karena hasil malloc berupa pointer, fungsi ini juga mengembalikan pointer Node.",
      },
      {
        title: "3. Isi nilai dan pointer",
        code: `node->key = key;
node->left = NULL;
node->right = NULL;`,
        explain:
          "Key diisi dari input. Pointer kiri dan kanan dibuat NULL karena saat pertama dibuat, node belum punya anak.",
      },
      {
        title: "4. Height awal",
        code: `node->height = 1;`,
        explain:
          "Pada kode ini daun dihitung height 1. Kalau tree kosong, height-nya 0; kalau satu node, height-nya 1.",
      },
    ],
  },
  height: {
    label: "Check Height",
    title: "Kode Mengecek dan Menghitung Height",
    subtitle: "Height dipakai sebagai dasar menghitung balance factor dan menentukan apakah tree perlu rotasi.",
    code: `int max(int a, int b) {
  return (a > b) ? a : b;
}

int height(struct Node *node) {
  if (node == NULL)
    return 0;

  return node->height;
}

node->height = 1 + max(height(node->left), height(node->right));`,
    bullets: [
      "height(NULL) bernilai 0 supaya subtree kosong tidak menambah tinggi.",
      "Height node diambil dari field node->height.",
      "Rumus update height adalah 1 + tinggi anak terbesar.",
      "Update height dilakukan setelah insert, delete, dan rotasi.",
      "Tanpa height yang benar, balance factor bisa salah.",
    ],
    blocks: [
      {
        title: "1. Fungsi max",
        code: `int max(int a, int b) {
  return (a > b) ? a : b;
}`,
        explain:
          "Fungsi ini memilih tinggi subtree yang lebih besar. Height node selalu mengikuti cabang terpanjang.",
      },
      {
        title: "2. Height untuk node kosong",
        code: `if (node == NULL)
  return 0;`,
        explain:
          "Subtree kosong dihitung tinggi 0. Ini membuat perhitungan daun menjadi 1 karena 1 + max(0, 0).",
      },
      {
        title: "3. Ambil height node",
        code: `return node->height;`,
        explain:
          "Program tidak menghitung ulang seluruh subtree setiap saat. Nilai height disimpan di node agar lebih efisien.",
      },
      {
        title: "4. Update height",
        code: `node->height = 1 + max(height(node->left), height(node->right));`,
        explain:
          "Setelah struktur berubah, node memperbarui height berdasarkan anak kiri dan kanan. Angka 1 adalah node itu sendiri.",
      },
    ],
  },
  balance: {
    label: "Check Balance",
    title: "Kode Mengecek Balance Factor",
    subtitle: "Balance factor menentukan apakah sebuah node masih memenuhi aturan AVL.",
    code: `int getBalance(struct Node *node) {
  if (node == NULL)
    return 0;

  return height(node->left) - height(node->right);
}`,
    bullets: [
      "Balance factor dihitung dari tinggi kiri dikurangi tinggi kanan.",
      "Node AVL valid jika balance factor berada di -1, 0, atau 1.",
      "BF positif berarti subtree kiri lebih tinggi.",
      "BF negatif berarti subtree kanan lebih tinggi.",
      "Jika BF lebih dari 1 atau kurang dari -1, node perlu diseimbangkan.",
    ],
    blocks: [
      {
        title: "1. Node kosong dianggap seimbang",
        code: `if (node == NULL)
  return 0;`,
        explain:
          "NULL tidak punya anak, jadi tidak mungkin melanggar AVL. Karena itu balance factor untuk NULL dibuat 0.",
      },
      {
        title: "2. Rumus balance factor",
        code: `return height(node->left) - height(node->right);`,
        explain:
          "Jika hasilnya +2, tree berat ke kiri. Jika hasilnya -2, tree berat ke kanan. Dari sinilah kasus LL, RR, LR, atau RL dipilih.",
      },
    ],
  },
  rotateRight: {
    label: "Right Rotate",
    title: "Kode Right Rotation",
    subtitle: "Right rotation dipakai untuk kasus LL, atau langkah kedua pada kasus LR.",
    code: `struct Node *rightRotate(struct Node *y) {
  struct Node *x = y->left;
  struct Node *T2 = x->right;

  x->right = y;
  y->left = T2;

  y->height = max(height(y->left), height(y->right)) + 1;
  x->height = max(height(x->left), height(x->right)) + 1;

  return x;
}`,
    bullets: [
      "Node kiri naik menggantikan node yang tidak seimbang.",
      "Subtree T2 dipindah agar aturan BST tetap benar.",
      "Height y diperbarui lebih dulu karena y turun menjadi anak.",
      "Height x diperbarui setelahnya karena x menjadi akar subtree.",
      "Fungsi mengembalikan x sebagai akar subtree baru.",
    ],
    blocks: [
      {
        title: "1. Tentukan poros rotasi",
        code: `struct Node *x = y->left;
struct Node *T2 = x->right;`,
        explain:
          "y adalah node yang tidak seimbang. x adalah anak kiri yang akan naik. T2 disimpan sementara karena posisinya akan berpindah.",
      },
      {
        title: "2. Putar struktur",
        code: `x->right = y;
y->left = T2;`,
        explain:
          "x naik menjadi akar subtree. y turun ke kanan x. T2 menjadi anak kiri y agar urutan BST tetap valid.",
      },
      {
        title: "3. Update height setelah rotasi",
        code: `y->height = max(height(y->left), height(y->right)) + 1;
x->height = max(height(x->left), height(x->right)) + 1;`,
        explain:
          "Height y dihitung dulu karena posisinya lebih bawah. Setelah itu baru height x sebagai akar subtree baru.",
      },
      {
        title: "4. Kembalikan akar baru",
        code: `return x;`,
        explain:
          "Karena x sudah naik, fungsi harus mengembalikan x agar parent di atasnya tersambung ke akar subtree yang benar.",
      },
    ],
  },
  rotateLeft: {
    label: "Left Rotate",
    title: "Kode Left Rotation",
    subtitle: "Left rotation dipakai untuk kasus RR, atau langkah kedua pada kasus RL.",
    code: `struct Node *leftRotate(struct Node *x) {
  struct Node *y = x->right;
  struct Node *T2 = y->left;

  y->left = x;
  x->right = T2;

  x->height = max(height(x->left), height(x->right)) + 1;
  y->height = max(height(y->left), height(y->right)) + 1;

  return y;
}`,
    bullets: [
      "Node kanan naik menggantikan node yang tidak seimbang.",
      "Subtree T2 dipindah ke kanan node lama.",
      "Rotasi ini adalah kebalikan dari right rotation.",
      "Height harus diperbarui setelah pointer berubah.",
      "Fungsi mengembalikan y sebagai akar subtree baru.",
    ],
    blocks: [
      {
        title: "1. Tentukan poros rotasi",
        code: `struct Node *y = x->right;
struct Node *T2 = y->left;`,
        explain:
          "x adalah node yang tidak seimbang. y adalah anak kanan yang akan naik. T2 disimpan agar tidak hilang saat pointer diputar.",
      },
      {
        title: "2. Putar struktur",
        code: `y->left = x;
x->right = T2;`,
        explain:
          "y naik menjadi akar subtree. x turun ke kiri y. T2 menjadi anak kanan x supaya aturan BST tetap benar.",
      },
      {
        title: "3. Update height setelah rotasi",
        code: `x->height = max(height(x->left), height(x->right)) + 1;
y->height = max(height(y->left), height(y->right)) + 1;`,
        explain:
          "x dihitung dulu karena setelah rotasi x berada lebih bawah. y dihitung terakhir sebagai akar subtree baru.",
      },
      {
        title: "4. Kembalikan akar baru",
        code: `return y;`,
        explain:
          "Parent subtree harus menerima y, karena y sekarang berada di posisi paling atas setelah rotasi kiri.",
      },
    ],
  },
  insert: {
    label: "Insert",
    title: "Kode Insert AVL",
    subtitle: "Alurnya: cari posisi daun, update height, cek BF, lalu rotasi jika perlu.",
    code: `struct Node *insertNode(struct Node *node, int key) {
  if (node == NULL)
    return newNode(key);

  if (key < node->key)
    node->left = insertNode(node->left, key);
  else if (key > node->key)
    node->right = insertNode(node->right, key);
  else
    return node;

  node->height = 1 + max(height(node->left), height(node->right));

  int balance = getBalance(node);

  if (balance > 1 && key < node->left->key)
    return rightRotate(node);        // LL

  if (balance < -1 && key > node->right->key)
    return leftRotate(node);         // RR

  if (balance > 1 && key > node->left->key) {
    node->left = leftRotate(node->left);
    return rightRotate(node);        // LR
  }

  if (balance < -1 && key < node->right->key) {
    node->right = rightRotate(node->right);
    return leftRotate(node);         // RL
  }

  return node;
}`,
    bullets: [
      "Baris awal adalah base case: kalau posisi sudah NULL, node baru dibuat sebagai daun.",
      "Jika key lebih kecil, rekursi turun ke kiri; jika lebih besar, turun ke kanan. Ini menjaga aturan BST.",
      "Setelah node masuk, height dihitung ulang dari bawah ke atas.",
      "Balance factor dipakai untuk memilih 4 kasus AVL: LL, RR, LR, atau RL.",
      "LL/RR cukup single rotation; LR/RL perlu double rotation.",
    ],
    blocks: [
      {
        title: "1. Base case: posisi kosong",
        code: `if (node == NULL)
  return newNode(key);`,
        explain:
          "Kalau rekursi sudah sampai NULL, berarti posisi sisip sudah ditemukan. Key baru dibuat sebagai daun dengan height awal 1.",
      },
      {
        title: "2. Cari posisi sesuai aturan BST",
        code: `if (key < node->key)
  node->left = insertNode(node->left, key);
else if (key > node->key)
  node->right = insertNode(node->right, key);
else
  return node;`,
        explain:
          "Nilai lebih kecil selalu masuk subtree kiri, nilai lebih besar masuk subtree kanan. Jika nilainya sama, node tidak ditambahkan supaya tidak ada duplikat.",
      },
      {
        title: "3. Hitung ulang tinggi node",
        code: `node->height = 1 + max(height(node->left), height(node->right));`,
        explain:
          "Setelah insert selesai di bawah, rekursi naik lagi. Setiap ancestor memperbarui height berdasarkan subtree kiri dan kanan.",
      },
      {
        title: "4. Cek balance factor",
        code: `int balance = getBalance(node);`,
        explain:
          "Balance factor menentukan apakah node masih AVL. Rumusnya height kiri dikurangi height kanan. Valid jika hasilnya -1, 0, atau 1.",
      },
      {
        title: "5. Pilih rotasi",
        code: `if (balance > 1 && key < node->left->key)
  return rightRotate(node);        // LL

if (balance < -1 && key > node->right->key)
  return leftRotate(node);         // RR

if (balance > 1 && key > node->left->key) {
  node->left = leftRotate(node->left);
  return rightRotate(node);        // LR
}

if (balance < -1 && key < node->right->key) {
  node->right = rightRotate(node->right);
  return leftRotate(node);         // RL
}`,
        explain:
          "Di tahap ini algoritma membaca arah sisipan terakhir. Jalur lurus LL/RR memakai satu rotasi, sedangkan jalur berbelok LR/RL memakai dua rotasi.",
      },
    ],
  },
  delete: {
    label: "Delete",
    title: "Kode Delete AVL",
    subtitle: "Delete dimulai seperti BST biasa, lalu setiap ancestor dicek ulang agar tetap AVL.",
    code: `struct Node *deleteNode(struct Node *root, int key) {
  if (root == NULL)
    return root;

  if (key < root->key)
    root->left = deleteNode(root->left, key);
  else if (key > root->key)
    root->right = deleteNode(root->right, key);
  else {
    if ((root->left == NULL) || (root->right == NULL)) {
      struct Node *temp = root->left ? root->left : root->right;

      if (temp == NULL) {
        temp = root;
        root = NULL;
      } else {
        *root = *temp;
      }

      free(temp);
    } else {
      struct Node *temp = minValueNode(root->right);
      root->key = temp->key;
      root->right = deleteNode(root->right, temp->key);
    }
  }

  if (root == NULL)
    return root;

  root->height = 1 + max(height(root->left), height(root->right));

  int balance = getBalance(root);

  if (balance > 1 && getBalance(root->left) >= 0)
    return rightRotate(root);        // LL

  if (balance > 1 && getBalance(root->left) < 0) {
    root->left = leftRotate(root->left);
    return rightRotate(root);        // LR
  }

  if (balance < -1 && getBalance(root->right) <= 0)
    return leftRotate(root);         // RR

  if (balance < -1 && getBalance(root->right) > 0) {
    root->right = rightRotate(root->right);
    return leftRotate(root);         // RL
  }

  return root;
}`,
    bullets: [
      "Pertama, cari node yang mau dihapus dengan aturan BST: kecil ke kiri, besar ke kanan.",
      "Jika node punya 0 atau 1 anak, node langsung diganti oleh anaknya atau menjadi NULL.",
      "Jika node punya 2 anak, ambil inorder successor, yaitu node terkecil dari subtree kanan.",
      "Setelah penghapusan, height dihitung ulang karena tinggi subtree bisa berubah.",
      "Berbeda dari insert, delete bisa membuat beberapa ancestor tidak seimbang, jadi pengecekan dilakukan saat rekursi naik.",
    ],
    blocks: [
      {
        title: "1. Cari node yang akan dihapus",
        code: `if (root == NULL)
  return root;

if (key < root->key)
  root->left = deleteNode(root->left, key);
else if (key > root->key)
  root->right = deleteNode(root->right, key);`,
        explain:
          "Bagian ini sama seperti pencarian BST. Kalau key lebih kecil turun kiri, kalau lebih besar turun kanan. Kalau root NULL, key tidak ditemukan.",
      },
      {
        title: "2. Kasus 0 atau 1 anak",
        code: `if ((root->left == NULL) || (root->right == NULL)) {
  struct Node *temp = root->left ? root->left : root->right;

  if (temp == NULL) {
    temp = root;
    root = NULL;
  } else {
    *root = *temp;
  }

  free(temp);
}`,
        explain:
          "Kalau node adalah daun, root dibuat NULL. Kalau punya satu anak, isi anak disalin naik menggantikan node yang dihapus.",
      },
      {
        title: "3. Kasus 2 anak",
        code: `struct Node *temp = minValueNode(root->right);
root->key = temp->key;
root->right = deleteNode(root->right, temp->key);`,
        explain:
          "Jika node punya dua anak, key diganti dengan inorder successor. Successor adalah nilai terkecil di subtree kanan, sehingga aturan BST tetap aman.",
      },
      {
        title: "4. Update height setelah delete",
        code: `if (root == NULL)
  return root;

root->height = 1 + max(height(root->left), height(root->right));`,
        explain:
          "Setelah node terhapus, tinggi subtree bisa berubah. Karena itu height dihitung ulang sebelum mengecek balance factor.",
      },
      {
        title: "5. Rebalance ancestor",
        code: `int balance = getBalance(root);

if (balance > 1 && getBalance(root->left) >= 0)
  return rightRotate(root);        // LL

if (balance > 1 && getBalance(root->left) < 0) {
  root->left = leftRotate(root->left);
  return rightRotate(root);        // LR
}

if (balance < -1 && getBalance(root->right) <= 0)
  return leftRotate(root);         // RR

if (balance < -1 && getBalance(root->right) > 0) {
  root->right = rightRotate(root->right);
  return leftRotate(root);         // RL
}`,
        explain:
          "Delete dicek dari bawah ke atas. Jadi setelah satu node dihapus, beberapa ancestor bisa ikut perlu rotasi.",
      },
    ],
  },
  minValue: {
    label: "Min Value",
    title: "Kode Mencari Minimum Value",
    subtitle: "Helper ini dipakai saat delete node yang punya dua anak, untuk mencari inorder successor.",
    code: `struct Node *minValueNode(struct Node *node) {
  struct Node *current = node;

  while (current->left != NULL)
    current = current->left;

  return current;
}`,
    bullets: [
      "Nilai terkecil di BST selalu berada di cabang paling kiri.",
      "Fungsi dimulai dari node tertentu, biasanya root subtree kanan.",
      "Loop terus turun ke kiri sampai tidak ada anak kiri lagi.",
      "Node terakhir itulah minimum value pada subtree tersebut.",
      "Pada delete dua anak, node ini dipakai sebagai pengganti key yang dihapus.",
    ],
    blocks: [
      {
        title: "1. Mulai dari subtree tertentu",
        code: `struct Node *current = node;`,
        explain:
          "current dipakai sebagai pointer berjalan. Untuk delete dua anak, biasanya fungsi dipanggil dengan root->right.",
      },
      {
        title: "2. Turun terus ke kiri",
        code: `while (current->left != NULL)
  current = current->left;`,
        explain:
          "Dalam BST, nilai yang lebih kecil selalu berada di kiri. Jadi node minimum ditemukan dengan berjalan ke kiri sampai mentok.",
      },
      {
        title: "3. Kembalikan node minimum",
        code: `return current;`,
        explain:
          "Saat loop selesai, current adalah node paling kiri. Itulah inorder successor jika pencarian dimulai dari subtree kanan.",
      },
      {
        title: "4. Pemakaian di delete",
        code: `struct Node *temp = minValueNode(root->right);
root->key = temp->key;`,
        explain:
          "Key node yang dihapus diganti dengan key successor. Setelah itu successor asli dihapus dari subtree kanan.",
      },
    ],
  },
  level: {
    label: "Hitung Level",
    title: "Kode Hitung Level Node",
    subtitle: "Level menunjukkan jarak node dari root. Root biasanya level 0, anak root level 1, dan seterusnya.",
    code: `int getLevel(struct Node *root, int key, int level) {
  if (root == NULL)
    return -1;

  if (root->key == key)
    return level;

  if (key < root->key)
    return getLevel(root->left, key, level + 1);

  return getLevel(root->right, key, level + 1);
}

void printNodeLevel(struct Node *root, int key) {
  int level = getLevel(root, key, 0);

  if (level == -1)
    printf("Node %d tidak ditemukan\\n", key);
  else
    printf("Node %d berada di level %d\\n", key, level);
}`,
    bullets: [
      "Parameter level menyimpan posisi saat ini selama pencarian dari root.",
      "Saat root NULL, pencarian gagal dan fungsi mengembalikan -1.",
      "Saat key ditemukan, nilai level saat itu langsung dikembalikan.",
      "Jika key lebih kecil, pencarian turun ke kiri sambil menambah level + 1.",
      "Jika ingin root dihitung sebagai level 1, cukup panggil getLevel(root, key, 1).",
    ],
    blocks: [
      {
        title: "1. Kondisi tidak ditemukan",
        code: `if (root == NULL)
  return -1;`,
        explain:
          "Kalau pencarian sudah sampai NULL, berarti node tidak ada di tree. Nilai -1 dipakai sebagai tanda gagal.",
      },
      {
        title: "2. Kondisi node ditemukan",
        code: `if (root->key == key)
  return level;`,
        explain:
          "Jika key sama dengan node saat ini, level yang sedang dibawa rekursi langsung dikembalikan.",
      },
      {
        title: "3. Turun kiri atau kanan",
        code: `if (key < root->key)
  return getLevel(root->left, key, level + 1);

return getLevel(root->right, key, level + 1);`,
        explain:
          "Setiap turun satu edge, level bertambah 1. Karena AVL tetap BST, arah pencarian cukup ditentukan dari perbandingan key.",
      },
      {
        title: "4. Cara memanggil fungsi",
        code: `int level = getLevel(root, key, 0);`,
        explain:
          "Angka 0 berarti root dianggap level 0. Jika materi dosen memakai root sebagai level 1, ganti pemanggilan menjadi getLevel(root, key, 1).",
      },
      {
        title: "5. Tampilkan hasil",
        code: `if (level == -1)
  printf("Node %d tidak ditemukan\\n", key);
else
  printf("Node %d berada di level %d\\n", key, level);`,
        explain:
          "Output dipisah menjadi dua kondisi: node tidak ditemukan atau node ditemukan di level tertentu.",
      },
    ],
  },
};

export const DEFAULT_CODE = `#include <stdio.h>
#include <stdlib.h>

struct Node {
  int key;
  struct Node *left;
  struct Node *right;
  int height;
};

int max(int a, int b) {
  return (a > b) ? a : b;
}

int height(struct Node *node) {
  if (node == NULL)
    return 0;

  return node->height;
}

struct Node *newNode(int key) {
  struct Node *node = (struct Node *)malloc(sizeof(struct Node));
  node->key = key;
  node->left = NULL;
  node->right = NULL;
  node->height = 1;

  return node;
}

int getBalance(struct Node *node) {
  if (node == NULL)
    return 0;

  return height(node->left) - height(node->right);
}

struct Node *rightRotate(struct Node *y) {
  struct Node *x = y->left;
  struct Node *T2 = x->right;

  x->right = y;
  y->left = T2;

  y->height = max(height(y->left), height(y->right)) + 1;
  x->height = max(height(x->left), height(x->right)) + 1;

  return x;
}

struct Node *leftRotate(struct Node *x) {
  struct Node *y = x->right;
  struct Node *T2 = y->left;

  y->left = x;
  x->right = T2;

  x->height = max(height(x->left), height(x->right)) + 1;
  y->height = max(height(y->left), height(y->right)) + 1;

  return y;
}

struct Node *insertNode(struct Node *node, int key) {
  if (node == NULL)
    return newNode(key);

  if (key < node->key)
    node->left = insertNode(node->left, key);
  else if (key > node->key)
    node->right = insertNode(node->right, key);
  else
    return node;

  node->height = 1 + max(height(node->left), height(node->right));

  int balance = getBalance(node);

  if (balance > 1 && key < node->left->key)
    return rightRotate(node);

  if (balance < -1 && key > node->right->key)
    return leftRotate(node);

  if (balance > 1 && key > node->left->key) {
    node->left = leftRotate(node->left);
    return rightRotate(node);
  }

  if (balance < -1 && key < node->right->key) {
    node->right = rightRotate(node->right);
    return leftRotate(node);
  }

  return node;
}

struct Node *minValueNode(struct Node *node) {
  struct Node *current = node;

  while (current->left != NULL)
    current = current->left;

  return current;
}

struct Node *deleteNode(struct Node *root, int key) {
  if (root == NULL)
    return root;

  if (key < root->key)
    root->left = deleteNode(root->left, key);
  else if (key > root->key)
    root->right = deleteNode(root->right, key);
  else {
    if ((root->left == NULL) || (root->right == NULL)) {
      struct Node *temp = root->left ? root->left : root->right;

      if (temp == NULL) {
        temp = root;
        root = NULL;
      } else {
        *root = *temp;
      }

      free(temp);
    } else {
      struct Node *temp = minValueNode(root->right);
      root->key = temp->key;
      root->right = deleteNode(root->right, temp->key);
    }
  }

  if (root == NULL)
    return root;

  root->height = 1 + max(height(root->left), height(root->right));

  int balance = getBalance(root);

  if (balance > 1 && getBalance(root->left) >= 0)
    return rightRotate(root);

  if (balance > 1 && getBalance(root->left) < 0) {
    root->left = leftRotate(root->left);
    return rightRotate(root);
  }

  if (balance < -1 && getBalance(root->right) <= 0)
    return leftRotate(root);

  if (balance < -1 && getBalance(root->right) > 0) {
    root->right = rightRotate(root->right);
    return leftRotate(root);
  }

  return root;
}

void preOrder(struct Node *root) {
  if (root != NULL) {
    printf("%d ", root->key);
    preOrder(root->left);
    preOrder(root->right);
  }
}

int main() {
  struct Node *root = NULL;

  root = insertNode(root, 30);
  root = insertNode(root, 22);
  root = insertNode(root, 45);
  root = insertNode(root, 15);
  root = insertNode(root, 27);
  root = insertNode(root, 34);
  root = insertNode(root, 10);
  root = insertNode(root, 18);
  root = insertNode(root, 29);
  root = insertNode(root, 12);

  preOrder(root);

  return 0;
}`;

/** --- AVL / BST core -------------------------------------------------- */

export function makeNode(value) {
  return { value, left: null, right: null, height: 1 };
}

export function getHeight(node) {
  return node ? node.height : 0;
}

export function updateHeight(node) {
  node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1;
}

export function fixHeights(node) {
  if (!node) return;
  fixHeights(node.left);
  fixHeights(node.right);
  updateHeight(node);
}

export function getBalance(node) {
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

export function compareValues(a, b) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

export function rotateRight(y) {
  const x = y.left;
  const t2 = x.right;
  x.right = y;
  y.left = t2;
  updateHeight(y);
  updateHeight(x);
  return x;
}

export function rotateLeft(x) {
  const y = x.right;
  const t2 = y.left;
  y.left = x;
  x.right = t2;
  updateHeight(x);
  updateHeight(y);
  return y;
}

export function insertBST(node, value) {
  if (!node) return makeNode(value);
  const comparison = compareValues(value, node.value);
  if (comparison < 0) node.left = insertBST(node.left, value);
  else if (comparison > 0) node.right = insertBST(node.right, value);
  updateHeight(node);
  return node;
}

export function insertAVL(node, value, logs = []) {
  if (!node) return makeNode(value);

  const comparison = compareValues(value, node.value);
  if (comparison < 0) node.left = insertAVL(node.left, value, logs);
  else if (comparison > 0) node.right = insertAVL(node.right, value, logs);
  else return node;

  updateHeight(node);
  const balance = getBalance(node);

  if (balance > 1 && compareValues(value, node.left.value) < 0) {
    logs.push(`LL di node ${node.value} -> right rotate`);
    return rotateRight(node);
  }
  if (balance < -1 && compareValues(value, node.right.value) > 0) {
    logs.push(`RR di node ${node.value} -> left rotate`);
    return rotateLeft(node);
  }
  if (balance > 1 && compareValues(value, node.left.value) > 0) {
    logs.push(`LR di node ${node.value} -> left rotate child, lalu right rotate`);
    node.left = rotateLeft(node.left);
    return rotateRight(node);
  }
  if (balance < -1 && compareValues(value, node.right.value) < 0) {
    logs.push(`RL di node ${node.value} -> right rotate child, lalu left rotate`);
    node.right = rotateRight(node.right);
    return rotateLeft(node);
  }
  return node;
}

export function cloneTree(node) {
  if (!node) return null;
  return {
    value: node.value,
    height: node.height,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

export function buildTree(values, mode) {
  let root = null;
  const logs = [];
  values.forEach((value) => {
    root = mode === "avl" ? insertAVL(root, value, logs) : insertBST(root, value);
  });
  return { root, logs };
}

export function parseCodeValue(raw) {
  const value = raw.trim();
  const quoted = value.match(/^["'](.+)["']$/);
  if (quoted) return quoted[1];
  const numberValue = Number(value);
  if (value !== "" && Number.isFinite(numberValue)) return numberValue;
  if (/^[A-Za-z]$/.test(value)) return value.toUpperCase();
  return null;
}

export function parseCodeValues(raw) {
  return raw
    .split(",")
    .map(parseCodeValue)
    .filter((value) => value !== null);
}

export function lastCodeArgument(raw) {
  const parts = raw.split(",");
  return parts.at(-1) ?? raw;
}

export function stripCodeComment(line) {
  const hashIndex = line.indexOf("#");
  const slashIndex = line.indexOf("//");
  const cutPoints = [hashIndex, slashIndex].filter((index) => index >= 0);
  const cleaned = cutPoints.length ? line.slice(0, Math.min(...cutPoints)) : line;
  return cleaned.trim().replace(/;$/, "").trim();
}

export function shouldSkipCodeLine(line) {
  return (
    line === "{" ||
    line === "}" ||
    line === "};" ||
    /^#/.test(line) ||
    /^if\b/i.test(line) ||
    /^else\b/i.test(line) ||
    /^for\b/i.test(line) ||
    /^while\b/i.test(line) ||
    /^int\s+main\s*\(/i.test(line) ||
    /^int\s+\w+/i.test(line) ||
    /^\w+->/i.test(line) ||
    /^return\b/i.test(line) ||
    /^struct\s+Node\b/i.test(line) ||
    /^free\s*\(/i.test(line) ||
    /^printf\s*\(/i.test(line) ||
    /^display\s*\(/i.test(line) ||
    /^inorder\s*\(/i.test(line) ||
    /^preorder\s*\(/i.test(line) ||
    /^postorder\s*\(/i.test(line)
  );
}

export function getRunnableCodeLines(source) {
  const lines = source.split(/\r?\n/);
  const mainIndex = lines.findIndex((line) => /\bint\s+main\s*\(/i.test(line));
  if (mainIndex < 0) {
    return lines.map((raw, index) => ({ raw, lineNumber: index + 1 }));
  }

  const runnable = [];
  let depth = 0;
  let enteredMain = false;

  for (let index = mainIndex; index < lines.length; index += 1) {
    const raw = lines[index];
    const opens = (raw.match(/{/g) ?? []).length;
    const closes = (raw.match(/}/g) ?? []).length;

    if (!enteredMain) {
      depth += opens - closes;
      enteredMain = opens > 0;
      continue;
    }

    if (depth <= 0) break;
    const trimmed = raw.trim();
    if (trimmed !== "}" && trimmed !== "};") {
      runnable.push({ raw, lineNumber: index + 1 });
    }
    depth += opens - closes;
  }

  return runnable;
}

export function runTreeCode(source) {
  let codeMode = "avl";
  let values = [];
  const errors = [];
  const trace = [];

  const unique = (nextValues) => {
    const seen = new Set();
    return nextValues.filter((value) => {
      const key = `${typeof value}:${value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  getRunnableCodeLines(source).forEach(({ raw: rawLine, lineNumber }) => {
    const line = stripCodeComment(rawLine);
    if (!line) return;

    const modeMatch = line.match(/^(mode|setMode)\s*\(\s*(["']?)(bst|avl)\2\s*\)$/i);
    const nullRootMatch = line.match(/^\w+\s*=\s*NULL$/i);
    const insertMatch = line.match(/^(?:\w+\s*=\s*)?(insert|insertNode)\s*\((.+)\)$/i);
    const insertManyMatch = line.match(/^insertMany\s*\(\s*\[(.*)\]\s*\)$/i);
    const deleteMatch = line.match(/^(?:\w+\s*=\s*)?(delete|remove|deleteNode)\s*\((.+)\)$/i);
    const clearMatch = line.match(/^clear\s*\(\s*\)$/i);

    if (shouldSkipCodeLine(line)) return;

    if (modeMatch) {
      codeMode = modeMatch[3].toLowerCase();
      trace.push(`Baris ${lineNumber}: mode ${codeMode.toUpperCase()}`);
      return;
    }

    if (insertMatch) {
      const rawValue = lastCodeArgument(insertMatch[2]);
      const value = parseCodeValue(rawValue);
      if (value === null) {
        if (/^\s*[A-Za-z_]\w*\s*$/.test(rawValue)) return;
        errors.push(`Baris ${lineNumber}: nilai insert tidak valid.`);
        return;
      }
      values = unique([...values, value]);
      trace.push(`Baris ${lineNumber}: insert ${value}`);
      return;
    }

    if (insertManyMatch) {
      const nextValues = parseCodeValues(insertManyMatch[1]);
      if (!nextValues.length) {
        errors.push(`Baris ${lineNumber}: insertMany perlu minimal satu nilai.`);
        return;
      }
      values = unique([...values, ...nextValues]);
      trace.push(`Baris ${lineNumber}: insertMany ${nextValues.join(", ")}`);
      return;
    }

    if (deleteMatch) {
      const rawValue = lastCodeArgument(deleteMatch[2]);
      const value = parseCodeValue(rawValue);
      if (value === null) {
        if (/^\s*[A-Za-z_]\w*\s*$/.test(rawValue)) return;
        errors.push(`Baris ${lineNumber}: nilai delete tidak valid.`);
        return;
      }
      values = values.filter((item) => item !== value);
      trace.push(`Baris ${lineNumber}: delete ${value}`);
      return;
    }

    if (clearMatch) {
      values = [];
      trace.push(`Baris ${lineNumber}: clear tree`);
      return;
    }

    if (nullRootMatch) {
      values = [];
      trace.push(`Baris ${lineNumber}: root = NULL`);
      return;
    }

    errors.push(`Baris ${lineNumber}: baris ini belum bisa divisualkan.`);
  });

  const { root, logs } = buildTree(values, codeMode);
  const lastValue = values.at(-1);
  return {
    mode: codeMode,
    values,
    root,
    logs,
    trace,
    errors,
    highlights: lastValue === undefined ? {} : { [lastValue]: "grand" },
  };
}

/** --- Layout (SVG) ---------------------------------------------------- */

export function getLayout(root, options = {}) {
  if (!root) return { nodes: [], edges: [], width: 600, height: 200 };

  const gapX = options.gapX ?? 72;
  const gapY = options.gapY ?? 96;
  const offsetX = options.offsetX ?? 48;
  const offsetY = options.offsetY ?? 56;
  const nodeR = options.nodeR ?? 22;

  let index = 0;
  const nodes = [];
  const edges = [];

  function walk(node, depth, parent = null) {
    if (!node) return null;
    const left = walk(node.left, depth + 1, node.value);
    const xIndex = index++;
    const current = {
      id: node.value,
      value: node.value,
      x: xIndex * gapX + offsetX,
      y: depth * gapY + offsetY,
      depth,
      bf: getBalance(node),
      height: node.height,
      parent,
      r: nodeR,
    };
    nodes.push(current);
    const right = walk(node.right, depth + 1, node.value);
    if (left) edges.push({ from: current.value, to: left });
    if (right) edges.push({ from: current.value, to: right });
    return current.value;
  }

  walk(root, 0);
  const maxDepth = nodes.length ? Math.max(...nodes.map((n) => n.depth)) : 0;
  return {
    nodes,
    edges,
    width: Math.max(options.minWidth ?? 720, index * gapX + offsetX * 2 + 80),
    height: Math.max(260, maxDepth * gapY + offsetY + 100),
  };
}

/** --- Rotation Lab: simulasi murni penyisipan AVL (bukan pohon statis) ------- */

export const LAB_INSERT_SEQUENCES = {
  LL: [50, 40, 30],
  RR: [50, 60, 70],
  LR: [50, 30, 40],
  RL: [50, 70, 60],
};

/** Tahap 1 insert AVL: tempatkan key sebagai daun (memenuhi urutan pohon pencarian biner). */
export function insertLeafOnly(root, value) {
  if (!root) return makeNode(value);
  const comparison = compareValues(value, root.value);
  if (comparison < 0) root.left = insertLeafOnly(root.left, value);
  else if (comparison > 0) root.right = insertLeafOnly(root.right, value);
  updateHeight(root);
  return root;
}

export function depthOf(root, targetVal, d = 0) {
  if (!root) return -1;
  if (root.value === targetVal) return d;
  const l = depthOf(root.left, targetVal, d + 1);
  if (l >= 0) return l;
  return depthOf(root.right, targetVal, d + 1);
}

/** Node tidak seimbang terdalam (terjauh dari akar) — pola trace dari daun ke atas. */
export function findDeepestUnbalanced(root) {
  let best = null;
  function walk(n) {
    if (!n) return;
    walk(n.left);
    walk(n.right);
    if (Math.abs(getBalance(n)) > 1) {
      const dep = depthOf(root, n.value);
      if (!best || dep > best.depth) best = { node: n, depth: dep };
    }
  }
  walk(root);
  return best;
}

export function rotateNodeInTree(root, pivotVal, rotateFn) {
  if (!root) return null;
  if (root.value === pivotVal) return rotateFn(root);
  if (compareValues(pivotVal, root.value) < 0) root.left = rotateNodeInTree(root.left, pivotVal, rotateFn);
  else root.right = rotateNodeInTree(root.right, pivotVal, rotateFn);
  updateHeight(root);
  return root;
}

export function avlCaseAt(node) {
  const b = getBalance(node);
  if (b > 1) {
    const lb = getBalance(node.left);
    return lb >= 0 ? "LL" : "LR";
  }
  if (b < -1) {
    const rb = getBalance(node.right);
    return rb <= 0 ? "RR" : "RL";
  }
  return null;
}

export const HIGHLIGHT_LEGEND = [
  { key: "pivot", label: "Node kritis (T)", desc: "Node AVL yang tidak seimbang." },
  { key: "child", label: "Anak di jalur rotasi", desc: "Anak kiri/kanan dari T pada pola LL–RR." },
  { key: "grand", label: "Sumbu (LR / RL)", desc: "Node di lintasan yang membentuk siku." },
];

export const PPT_HIGHLIGHT_LEGEND = [
  { key: "pivot", label: "Tidak seimbang", desc: "Node pertama yang melanggar |BF| <= 1." },
  { key: "child", label: "Jalur rotasi", desc: "Node yang menjadi anak utama pada rotasi." },
  { key: "grand", label: "Node baru / sumbu", desc: "Node sisipan atau poros double rotation." },
];

export function treeFromSpec(spec) {
  if (!spec) return null;
  const node = makeNode(spec.value);
  node.left = treeFromSpec(spec.left);
  node.right = treeFromSpec(spec.right);
  updateHeight(node);
  return node;
}

export function node(value, left = null, right = null) {
  return { value, left, right };
}

export const pptTreeSpecs = {
  llBefore12: node(
    30,
    node(22, node(15, node(10), node(18)), node(27, null, node(29))),
    node(45, node(34)),
  ),
  llAfter12: node(
    30,
    node(22, node(15, node(10, null, node(12)), node(18)), node(27, null, node(29))),
    node(45, node(34)),
  ),
  llRotated: node(
    22,
    node(15, node(10, null, node(12)), node(18)),
    node(30, node(27, null, node(29)), node(45, node(34))),
  ),
  lrBefore26: node(
    30,
    node(22, node(15, node(10)), node(27, node(24), node(29))),
    node(45, node(34)),
  ),
  lrAfter26: node(
    30,
    node(22, node(15, node(10)), node(27, node(24, null, node(26)), node(29))),
    node(45, node(34)),
  ),
  lrFirstRotation: node(
    30,
    node(27, node(22, node(15, node(10)), node(24, null, node(26))), node(29)),
    node(45, node(34)),
  ),
  lrFinal: node(
    27,
    node(22, node(15, node(10)), node(24, null, node(26))),
    node(30, node(29), node(45, node(34))),
  ),
  deleteStart: node(
    50,
    node(25, node(20, node(10)), node(40, node(30), node(45, node(42)))),
    node(60, node(55), node(65, null, node(70))),
  ),
  deleteAfter60: node(
    50,
    node(25, node(20, node(10)), node(40, node(30), node(45, node(42)))),
    node(55, null, node(65, null, node(70))),
  ),
  deleteRotate55: node(
    50,
    node(25, node(20, node(10)), node(40, node(30), node(45, node(42)))),
    node(65, node(55), node(70)),
  ),
  deleteRotate25: node(
    50,
    node(40, node(25, node(20, node(10)), node(30)), node(45, node(42))),
    node(65, node(55), node(70)),
  ),
  deleteFinal: node(
    40,
    node(25, node(20, node(10)), node(30)),
    node(50, node(45, node(42)), node(65, node(55), node(70))),
  ),
};

export const PPT_EXAMPLES = {
  insert12: {
    title: "Slide 15-16: Insert 12 (LL)",
    source: "Contoh single rotation dari PPT",
    steps: [
      {
        short: "Awal",
        title: "AVL awal sebelum 12 masuk",
        tree: treeFromSpec(pptTreeSpecs.llBefore12),
        highlights: {},
        bullets: [
          "Tree masih seimbang, tetapi sisi kiri node 30 sudah lebih tinggi.",
          "Skenario berikutnya menyisipkan 12 pada jalur 30 -> 22 -> 15 -> 10.",
        ],
      },
      {
        short: "Sisip 12",
        title: "12 menjadi daun baru",
        tree: treeFromSpec(pptTreeSpecs.llAfter12),
        highlights: { 12: "grand", 30: "pivot", 22: "child" },
        bullets: [
          "12 masuk sebagai anak kanan dari 10 sesuai aturan BST.",
          "Saat ditelusuri ke atas, node 30 menjadi tidak seimbang.",
          "Pola yang terbentuk adalah LL terhadap node 30, sehingga cukup single right rotation.",
        ],
      },
      {
        short: "Right rotate",
        title: "Rotasi kanan pada node 30",
        tree: treeFromSpec(pptTreeSpecs.llRotated),
        highlights: { 12: "grand", 30: "pivot", 22: "child" },
        bullets: [
          "Node 22 naik menggantikan 30 sebagai akar subtree.",
          "Subtree 27 berpindah menjadi anak kiri 30.",
          "Seluruh node kembali memenuhi |BF| <= 1.",
        ],
      },
    ],
  },
  insert26: {
    title: "Slide 23-25: Insert 26 (LR)",
    source: "Contoh double rotation dari PPT",
    steps: [
      {
        short: "Awal",
        title: "AVL awal sebelum 26 masuk",
        tree: treeFromSpec(pptTreeSpecs.lrBefore26),
        highlights: {},
        bullets: [
          "Tree awal mirip contoh sebelumnya, tetapi subtree kiri 30 membentuk cabang melalui 27.",
          "Skenario ini akan memicu pola left-right.",
        ],
      },
      {
        short: "Sisip 26",
        title: "26 menjadi daun baru",
        tree: treeFromSpec(pptTreeSpecs.lrAfter26),
        highlights: { 26: "grand", 30: "pivot", 22: "child" },
        bullets: [
          "26 masuk di kanan 24, masih mengikuti aturan BST.",
          "Node 30 melanggar AVL, tetapi jalurnya berbelok: kiri lalu kanan.",
          "Karena bentuknya LR, single rotation saja belum cukup.",
        ],
      },
      {
        short: "Rotate 22",
        title: "Rotasi kiri pada node 22",
        tree: treeFromSpec(pptTreeSpecs.lrFirstRotation),
        highlights: { 26: "grand", 30: "pivot", 27: "child", 22: "child" },
        bullets: [
          "Langkah pertama double rotation: putar kiri subtree yang berakar di 22.",
          "Node 27 naik sehingga lintasan di bawah 30 menjadi lurus.",
          "Ini menyiapkan langkah kedua, yaitu right rotation pada 30.",
        ],
      },
      {
        short: "Rotate 30",
        title: "Rotasi kanan pada node 30",
        tree: treeFromSpec(pptTreeSpecs.lrFinal),
        highlights: { 26: "grand", 30: "pivot", 27: "child" },
        bullets: [
          "Node 27 naik menjadi akar subtree.",
          "22 berada di kiri 27, sedangkan 30 berada di kanan 27.",
          "Penyeimbangan selesai dan struktur tetap valid sebagai BST.",
        ],
      },
    ],
  },
  delete60: {
    title: "Slide 27-30: Delete 60",
    source: "Contoh deletion panjang dari PPT",
    steps: [
      {
        short: "Awal",
        title: "AVL awal sebelum node 60 dihapus",
        tree: treeFromSpec(pptTreeSpecs.deleteStart),
        highlights: { 60: "grand" },
        bullets: [
          "Node 60 memiliki satu anak kiri dan satu subtree kanan.",
          "Pada contoh PPT, 60 diganti oleh 55 lalu proses balance dilanjutkan ke akar.",
        ],
      },
      {
        short: "Hapus 60",
        title: "60 dihapus, 55 naik",
        tree: treeFromSpec(pptTreeSpecs.deleteAfter60),
        highlights: { 55: "pivot", 65: "child" },
        bullets: [
          "Setelah deletion BST, node 55 menjadi akar subtree kanan 50.",
          "Node 55 tidak seimbang karena sisi kanan lebih tinggi.",
          "Kasus pertama pada jalur ini adalah RR, maka dilakukan left rotation pada 55.",
        ],
      },
      {
        short: "Rotate 55",
        title: "Single rotation pada node 55",
        tree: treeFromSpec(pptTreeSpecs.deleteRotate55),
        highlights: { 55: "pivot", 65: "child" },
        bullets: [
          "65 naik menggantikan 55 di subtree kanan 50.",
          "Deletion belum selesai karena setelah rotasi kita tetap menelusuri ancestor.",
          "Berikutnya node 50 menjadi titik yang perlu diseimbangkan.",
        ],
      },
      {
        short: "Rotate 25",
        title: "Langkah pertama double rotation pada node 50",
        tree: treeFromSpec(pptTreeSpecs.deleteRotate25),
        highlights: { 50: "pivot", 25: "child", 40: "grand" },
        bullets: [
          "Node 50 berat ke kiri, tetapi anak kirinya 25 berat ke kanan.",
          "Itu pola LR pada node 50.",
          "Langkah pertama: left rotation pada 25, sehingga 40 naik di sisi kiri 50.",
        ],
      },
      {
        short: "Rotate 50",
        title: "Langkah kedua double rotation pada node 50",
        tree: treeFromSpec(pptTreeSpecs.deleteFinal),
        highlights: { 50: "pivot", 40: "grand" },
        bullets: [
          "Langkah kedua: right rotation pada 50.",
          "Node 40 menjadi akar baru tree pada contoh PPT.",
          "Setelah ini semua subtree kembali seimbang.",
        ],
      },
    ],
  },
};

export const DELETION_OPERATION_STEPS = [
  {
    short: "Awal",
    title: "Tree awal sebelum operasi delete",
    tree: treeFromSpec(
      node(
        50,
        node(30, node(20, node(10)), node(40)),
        node(70, node(60, null, node(65)), node(80)),
      ),
    ),
    highlights: {},
    bullets: [
      "Operasi delete selalu dimulai seperti BST: cari node target dari root.",
      "Setelah node dihapus, AVL mengecek ulang height dan balance factor dari bawah ke atas.",
      "Ilustrasi ini menampilkan tiga kasus dasar deletion dan satu tahap rebalance.",
    ],
  },
  {
    short: "Daun",
    title: "Kasus 1 — hapus node daun",
    tree: treeFromSpec(
      node(
        50,
        node(30, node(20, node(10)), node(40)),
        node(70, node(60, null, node(65)), node(80)),
      ),
    ),
    highlights: { 10: "grand", 20: "child" },
    bullets: [
      "Contoh target: node 10.",
      "Node 10 tidak punya anak, jadi cukup diputus dari parent-nya.",
      "Setelah itu parent 20 dan ancestor di atasnya akan dihitung ulang height-nya.",
    ],
    code: `if (temp == NULL) {
  temp = root;
  root = NULL;
}

free(temp);`,
  },
  {
    short: "Hasil daun",
    title: "Setelah node daun dihapus",
    tree: treeFromSpec(
      node(
        50,
        node(30, node(20), node(40)),
        node(70, node(60, null, node(65)), node(80)),
      ),
    ),
    highlights: { 20: "child", 30: "pivot" },
    bullets: [
      "Node 10 sudah hilang dari subtree kiri.",
      "Struktur BST tetap valid karena tidak ada anak yang perlu dipindahkan.",
      "AVL tetap perlu mengecek BF pada jalur 20 -> 30 -> 50.",
    ],
  },
  {
    short: "Satu anak",
    title: "Kasus 2 — hapus node dengan satu anak",
    tree: treeFromSpec(
      node(
        50,
        node(30, node(20), node(40)),
        node(70, node(60, null, node(65)), node(80)),
      ),
    ),
    highlights: { 60: "pivot", 65: "child" },
    bullets: [
      "Contoh target: node 60.",
      "Node 60 hanya punya satu anak, yaitu 65.",
      "Saat 60 dihapus, 65 langsung naik menggantikan posisi 60.",
    ],
    code: `struct Node *temp = root->left ? root->left : root->right;
*root = *temp;
free(temp);`,
  },
  {
    short: "Hasil satu",
    title: "Setelah node satu anak dihapus",
    tree: treeFromSpec(
      node(
        50,
        node(30, node(20), node(40)),
        node(70, node(65), node(80)),
      ),
    ),
    highlights: { 65: "child", 70: "pivot" },
    bullets: [
      "Node 65 naik ke posisi yang sebelumnya ditempati 60.",
      "Ini aman untuk BST karena 65 tetap berada di subtree kiri dari 70.",
      "Height dari node 70 dan 50 kemudian diperbarui.",
    ],
  },
  {
    short: "Dua anak",
    title: "Kasus 3 — hapus node dengan dua anak",
    tree: treeFromSpec(
      node(
        50,
        node(30, node(20), node(40)),
        node(70, node(65), node(80)),
      ),
    ),
    highlights: { 50: "pivot", 65: "grand", 70: "child" },
    bullets: [
      "Contoh target: node 50.",
      "Karena 50 punya dua anak, key-nya diganti dengan inorder successor.",
      "Successor diambil dari nilai terkecil pada subtree kanan, yaitu 65.",
    ],
    code: `struct Node *temp = minValueNode(root->right);
root->key = temp->key;
root->right = deleteNode(root->right, temp->key);`,
  },
  {
    short: "Successor",
    title: "Successor naik menggantikan node target",
    tree: treeFromSpec(
      node(
        65,
        node(30, node(20), node(40)),
        node(70, null, node(80)),
      ),
    ),
    highlights: { 65: "grand", 70: "child" },
    bullets: [
      "Key 50 diganti menjadi 65.",
      "Node 65 yang asli kemudian dihapus dari subtree kanan.",
      "Setelah replacement, program tetap melakukan update height dan cek balance.",
    ],
  },
  {
    short: "Validasi",
    title: "Validasi akhir — tidak perlu rotasi",
    tree: treeFromSpec(
      node(
        65,
        node(30, node(20), node(40)),
        node(70, null, node(80)),
      ),
    ),
    highlights: { 65: "grand", 30: "child", 70: "child" },
    bullets: [
      "Setelah successor 65 menggantikan 50, semua balance factor masih valid.",
      "Rumus BF adalah height(subtree kiri) - height(subtree kanan).",
      "BF node 65 = 2 - 2 = 0, BF node 30 = 1 - 1 = 0, dan BF node 70 = 0 - 1 = -1.",
      "Karena tidak ada node dengan |BF| > 1, operasi delete selesai tanpa rotasi.",
    ],
    code: `BF = height(left) - height(right)

Node 20, 40, 80:
BF = 0 - 0 = 0

Node 30:
BF = height(20) - height(40)
BF = 1 - 1 = 0

Node 70:
BF = height(NULL) - height(80)
BF = 0 - 1 = -1

Node 65:
BF = height(30) - height(70)
BF = 2 - 2 = 0`,
  },
];

export function buildAVLRotationLab(caseName) {
  const seq = [...LAB_INSERT_SEQUENCES[caseName]];
  const steps = [];

  steps.push({
    id: "intro",
    short: "Awal",
    title: "Rotation Lab — penyisipan pohon AVL",
    bullets: [
      "Semua langkah di sini memakai algoritma AVL sungguhan: sisip daun → perbarui tinggi & BF → rotasi jika perlu.",
      "Bukan pohon statis: urutan angka diproses seperti insert ke AVL (daun dulu, lalu rotasi bila perlu).",
      `Untuk tab ${caseName}, urutan demo: ${seq.join(" → ")}.`,
      "Aturan pohon pencarian biner tetap dipenuhi di setiap tahap.",
    ],
    tree: null,
    highlights: {},
  });

  let root = null;

  for (const v of seq) {
    root = insertLeafOnly(root, v);
    fixHeights(root);

    const nextUnbal = findDeepestUnbalanced(root);
    const perluRotasi = nextUnbal !== null;
    steps.push({
      id: `leaf-${v}`,
      short: `Sisip ${v}`,
      title: `Tahap 1 — menyisipkan ${v}`,
      bullets: [
        `Key ${v} ditempatkan sebagai daun baru (posisi mengikuti aturan pohon pencarian biner).`,
        "Tinggi tiap node di jalur dari daun ke akar sudah dihitung ulang.",
        perluRotasi
          ? "Ada node dengan |BF| > 1. Penyeimbangan AVL dilakukan pada langkah “AVL · …” berikutnya."
          : "Semua node masih dalam |BF| ≤ 1 — lanjut sisip berikutnya atau selesai.",
      ],
      tree: cloneTree(root),
      highlights: { [v]: "grand" },
    });

    while (true) {
      const bad = findDeepestUnbalanced(root);
      if (!bad) break;

      const { node: Tnode } = bad;
      const T = Tnode.value;
      const kind = avlCaseAt(Tnode);
      if (!kind) break;

      if (kind === "LL") {
        const L = Tnode.left.value;
        root = rotateNodeInTree(root, T, rotateRight);
        fixHeights(root);
        steps.push({
          id: `fix-LL-${T}-${v}`,
          short: `AVL · LL`,
          title: `Penyeimbangan AVL — pola LL di node ${T}`,
          bullets: [
            `Node ${T} punya BF = +2: subtree kiri lebih tinggi dari kanan.`,
            `Anak kiri ${L} condong ke kiri juga (bukan “siku”) → pola LL.`,
            "Perbaikan: satu kali right-rotate pada node " + T + " (mirip slide: single rotation).",
          ],
          tree: cloneTree(root),
          highlights: { [T]: "pivot", [L]: "child" },
        });
      } else if (kind === "RR") {
        const R = Tnode.right.value;
        root = rotateNodeInTree(root, T, rotateLeft);
        fixHeights(root);
        steps.push({
          id: `fix-RR-${T}-${v}`,
          short: `AVL · RR`,
          title: `Penyeimbangan AVL — pola RR di node ${T}`,
          bullets: [
            `Node ${T} punya BF = −2: subtree kanan lebih tinggi.`,
            `Anak kanan ${R} condong ke kanan → pola RR.`,
            "Perbaikan: satu kali left-rotate pada node " + T + ".",
          ],
          tree: cloneTree(root),
          highlights: { [T]: "pivot", [R]: "child" },
        });
      } else if (kind === "LR") {
        const L = Tnode.left.value;
        const M = Tnode.left.right?.value;
        root = rotateNodeInTree(root, L, rotateLeft);
        fixHeights(root);
        steps.push({
          id: `fix-LR-a-${T}-${v}`,
          short: `AVL · LR (1/2)`,
          title: `Double rotation LR — putar kiri pada node ${L}`,
          bullets: [
            `Node ${T} tidak seimbang; anak kiri ${L} “condong ke kanan” (bentuk siku) → pola LR.`,
            "Langkah pertama standar AVL: left-rotate pada subtree yang berakar di " + L + ".",
            M ? `Ini mengangkat sumbu ${M} supaya jalur jadi lurus ke kiri.` : "Ini meluruskan jalur sebelum putaran kedua.",
          ],
          tree: cloneTree(root),
          highlights: { [T]: "pivot", [L]: "child", ...(M ? { [M]: "grand" } : {}) },
        });

        root = rotateNodeInTree(root, T, rotateRight);
        fixHeights(root);
        steps.push({
          id: `fix-LR-b-${T}-${v}`,
          short: `AVL · LR (2/2)`,
          title: `Double rotation LR — putar kanan pada node ${T}`,
          bullets: [
            "Setelah putaran pertama, struktur di bawah " + T + " sudah seperti pola LL.",
            "Langkah kedua: right-rotate pada node " + T + " untuk menyelesaikan penyeimbangan AVL.",
          ],
          tree: cloneTree(root),
          highlights: { [T]: "pivot", [L]: "child", ...(M ? { [M]: "grand" } : {}) },
        });
      } else if (kind === "RL") {
        const R = Tnode.right.value;
        const M = Tnode.right.left?.value;
        root = rotateNodeInTree(root, R, rotateRight);
        fixHeights(root);
        steps.push({
          id: `fix-RL-a-${T}-${v}`,
          short: `AVL · RL (1/2)`,
          title: `Double rotation RL — putar kanan pada node ${R}`,
          bullets: [
            `Node ${T} tidak seimbang; anak kanan ${R} “condong ke kiri” → pola RL.`,
            "Langkah pertama standar AVL: right-rotate pada subtree yang berakar di " + R + ".",
            M ? `Sumbu ${M} naik untuk meluruskan jalur ke kanan.` : "Ini mempersiapkan pola RR murni.",
          ],
          tree: cloneTree(root),
          highlights: { [T]: "pivot", [R]: "child", ...(M ? { [M]: "grand" } : {}) },
        });

        root = rotateNodeInTree(root, T, rotateLeft);
        fixHeights(root);
        steps.push({
          id: `fix-RL-b-${T}-${v}`,
          short: `AVL · RL (2/2)`,
          title: `Double rotation RL — putar kiri pada node ${T}`,
          bullets: [
            "Setelah putaran pertama, di bawah " + T + " mirip pola RR.",
            "Langkah kedua: left-rotate pada node " + T + ".",
          ],
          tree: cloneTree(root),
          highlights: { [T]: "pivot", [R]: "child", ...(M ? { [M]: "grand" } : {}) },
        });
      } else break;
    }
  }

  const meta = {
    LL: {
      title: "LL dalam AVL — single right rotation",
      formula: "Setelah sisip daun, jika pola LL: rotateRight(T) sekali.",
      insertHint: "Urutan demo memicu satu kasus LL pada sisipan terakhir.",
    },
    RR: {
      title: "RR dalam AVL — single left rotation",
      formula: "Jika pola RR: rotateLeft(T) sekali.",
      insertHint: "Cerminan LL ke sisi kanan; murni dari insert AVL.",
    },
    LR: {
      title: "LR dalam AVL — double rotation",
      formula: "rotateLeft(L) lalu rotateRight(T); keduanya bagian dari satu proses insert AVL.",
      insertHint: "Terjadi saat anak kiri membentuk siku (berat ke kanan).",
    },
    RL: {
      title: "RL dalam AVL — double rotation",
      formula: "rotateRight(R) lalu rotateLeft(T).",
      insertHint: "Cerminan LR pada anak kanan.",
    },
  }[caseName];

  return { caseName, meta, steps };
}
