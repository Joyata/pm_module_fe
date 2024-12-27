
import Swal from 'sweetalert2'
import axios from 'axios'
import router from '../router'

export default {
  // method
  toast(message) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      type: 'success',
      title: 'Info:',
      text: message,
    })
  },
  error(message) {
    Swal.fire({
      heightAuto: false,
      icon: 'error',
      // eslint-disable-next-line no-useless-concat
      title: 'Oops...',
      text: message || 'Something went wrong',
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-primary',
      },
    })
  },
  warning(message) {
    Swal.fire({
      heightAuto: false,
      icon: 'warning',
      // eslint-disable-next-line no-useless-concat
      title: 'Oops...',
      text: message || 'Something went wrong',
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-primary',
      },
    })
  },
  closeSwal() {
    const elements = document.getElementsByClassName('.swal2-container')
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0])
    }
  },
  getResponseMessage(value) {
    if (value.data) return value.data.message
    return value.message || 'Something went wrong'
  },
  backToPreviousPage() {
    Swal.fire({
      heightAuto: false,
      title: '<h5><strong>Leave this page?</strong></h5>',
      width: 300,
      showCancelButton: true,
      confirmButtonText: 'Ya',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-primary ml-1',
      },
    }).then(result => {
      if (result.value) {
        router.back()
      }
    })
  },
  async errorTokenSwalPassword(path, msg) {
    const noHp = localStorage.getItem('userNoHp')
    await Swal.fire({
      title: `<h5><strong> Token anda telah habis, silahkan masukkan kembali password untuk pengguna ${noHp}`,
      html: `Silahkan masukkan Kata Sandi untuk Nomor Telepon <strong>${noHp}</strong><br/>`,
      input: 'password',
      showDenyButton: true,
      confirmButtonText: 'Login',
      denyButtonText: 'Gunakan Nomor Lain',
      customClass: {
        confirmButton: 'btn btn-primary',
        denyButton: 'ml-1',
      },
      allowEscapeKey: false,
      showLoaderOnConfirm: true,
      showLoaderOnDeny: true,
      preConfirm: async password => {
        const form = {
          no_hp: localStorage.getItem('userNoHp'),
          password,
        }
        const res = await api.login(form)
        return res
      },
      allowOutsideClick: () => false,
      preDeny: () => {
        localStorage.clear()
        window.location.reload('/login')
      },
    }).then(res => {
      if (res.isConfirmed) {
        if (res.value.status === 200) {
          const result = res.value.data
          localStorage.setItem('userId', result.data.userId)
          localStorage.setItem('userEmail', result.data.userEmail)
          localStorage.setItem('userAvatar', result.data.userAvatar)
          localStorage.setItem('userAvatar64', result.data.userAvatar64 || '')
          localStorage.setItem('permission', JSON.stringify(result.data.userPermission) || '')
          localStorage.setItem('token', result.token)
          localStorage.setItem('userNoHp', result.data.userNoHp)
          axios.defaults.headers.common.Authorization = `Bearer ${result.token}`
          // axios.defaults.headers.common['auth-token'] = result.token
          // eslint-disable-next-line no-restricted-globals
          location.reload()
        } else {
          $toast.error(res.value.msg)
          this.errorToken(path, 'Password Salah!', false)
        }
      }
    }).catch(error => error)
  },
  async errorToken(path, msg) {
    await this.errorTokenSwalPassword(path, msg)
  },

}
